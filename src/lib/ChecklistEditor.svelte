<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, DotsHorizontal, Check, DocumentRemove } from 'svelte-heros';
	import { navigateBack } from '../utils/navigate-back';
	import { swipe } from 'svelte-gestures';
	import {
		customCategoryId,
		getState,
		otherCategoryId,
		setState
	} from '../utils/local-storage-state';
	import type {
		CategoryOption,
		CheckList,
		CheckListItem,
		CheckListItemEditModel,
		KGarooState,
		Proposition
	} from '../types';
	import BottomMenu from './BottomMenu.svelte';
	import { Button, Modal, Toast } from 'flowbite-svelte';
	import { afterUpdate, onMount } from 'svelte';
	import { locale, t, translate } from '../utils/i18n';
	const state = getState();
	export let isShowPropositions = false;
	export let listName: string = translate($locale, 'lists.create_new_list.header');
	const otherCategoryName = translate($locale, 'lists.create_new_list.other-category');
	const customCategoryName = translate($locale, 'lists.create_new_list.create-category');
	export let listId = '' + new Date().getTime() + Math.random();
	let listFuzzySearch: any;
	let listHash: string;
	let isShowPossibleDuplicateToast = false;
	let highlighted = {};
	onMount(() => {
		reInitListFuzzySearch();
		listHash = getListHash();
	});

	afterUpdate(() => {
		if (items?.length === 0) {
			items.push({
				id: '' + new Date().getTime() + Math.random(),
				itemDescription: '',
				isEdited: true,
				checked: false,
				selected: false,
				category: otherCategoryName
			});
			items = [...items];
		}
		categoryOptions = categoryOptions.map((opt) => {
			if (opt.id === otherCategoryId) {
				return {
					...opt,
					name: otherCategoryName
				};
			}
			if (opt.id === customCategoryId) {
				return {
					...opt,
					name: customCategoryName
				};
			}
			return opt;
		});
	});

	function reInitListFuzzySearch(): void {
		const options = {
			includeScore: true,
			keys: ['itemDescription'],
			shouldSort: true,
			minMatchCharLength: 2,
			threshold: 0.4
		};
		listFuzzySearch = new (window as any).Fuse(items, options);
	}

	function getListHash(): string {
		return items.reduce((p, c) => p + c.itemDescription, '');
	}

	let isEditListName = false;
	export function onEditListNameOpen(): void {
		isEditListName = true;
	}
	export function onEditListNameSubmit(): void {
		isEditListName = false;
	}
	let categoryOptions = state.categoryOptions || [
		{
			id: otherCategoryId,
			name: otherCategoryName
		},
		{
			id: customCategoryId,
			name: customCategoryName
		}
	];
	export let propositions = state.propositions || [];
	export let items: CheckListItemEditModel[] = [
		{
			id: '' + new Date().getTime() + Math.random(),
			itemDescription: '',
			isEdited: true,
			checked: false,
			selected: false,
			category: otherCategoryName
		}
	];

	$: filteredPropositions = propositions.filter((prop) => {
		return !items.some(
			(item) => item.itemDescription === prop.itemDescription && item.category === prop.category
		);
	});

	$: isAnyItemsChecked = items.some((it) => it.selected);

	$: isCustomCategoryPopupOpen = changeCategoryTo === customCategoryName;
	export let changeCategoryTo = '';
	export let customInputCategory = '';

	export function handleChangeCategoryForSelectedClicked(): void {
		if (
			!changeCategoryTo?.length ||
			(changeCategoryTo === customCategoryName && !customInputCategory?.length)
		) {
			items = items.map((it) => ({ ...it, selected: false }));
			changeCategoryTo = '';
			customInputCategory = '';
			return;
		}
		if (changeCategoryTo === customCategoryName) {
			if (!categoryOptions.some((c) => c.name === customInputCategory)) {
				categoryOptions.push({ name: customInputCategory });
			}
			changeCategoryTo = customInputCategory;
			categoryOptions = [...categoryOptions];
		}
		items = items.map((it) => ({
			...it,
			category: it.selected ? changeCategoryTo : it.category,
			selected: false
		}));
		changeCategoryTo = '';
		customInputCategory = '';
	}

	function removeSelectedItems(): void {
		if (confirm('Selected items will be removed. Are you sure?')) {
			items = items.filter((it) => !it.selected);
			reInitListFuzzySearch();
			listHash = getListHash();
		}
	}

	export function onBackClicked(): void {
		if (!isEmptyList()) {
			saveList();
		}
		navigateBack();
	}

	export function onShowPropositionsClicked(): void {
		isShowPropositions = true;
	}

	export function onShowPropositionsCloseClicked(): void {
		isShowPropositions = false;
	}

	export function onAddPropositionClicked(prop): void {
		const newItem = {
			id: '' + new Date().getTime(),
			itemDescription: prop.itemDescription,
			category: prop.category,
			checked: false,
			selected: false,
			isEdited: false
		};
		if (items[items.length - 1]?.isEdited) {
			items.splice(items.length - 1, 0, newItem);
		} else {
			items.push(newItem);
		}
		items = [...items];
		// check for duplicate items

		if (newItem?.itemDescription?.length) {
			const dups = listFuzzySearch
				.search(newItem.itemDescription)
				.filter((dup) => dup.item.id !== newItem.id);
			if (dups?.length) {
				isShowPossibleDuplicateToast = true;
				highlighted = dups.reduce((p, c) => {
					return { ...p, [c.item.id]: true };
				}, {});
				highlighted = { ...highlighted, [newItem.id]: true };
				setTimeout(() => {
					(isShowPossibleDuplicateToast = false), (highlighted = {});
				}, 5000);
			}
		}
		reInitListFuzzySearch();
		listHash = getListHash();
	}

	export function onItemClick(id: string): void {
		items = items.map((source) => {
			return { ...source, isEdited: id === source.id, selected: false };
		});
		if (items.length > 1) {
			items = items.filter((item) => item.isEdited || item.itemDescription?.length > 0);
		}
	}

	export function onItemCategoryClicked(id: string): void {
		items = items.map((s) => ({ ...s, selected: id === s.id ? !s.selected : s.selected }));
	}

	export function onItemSwipe(id: string, event): void {
		if (event.detail.direction === 'left') {
			items = items.filter((item) => item.id !== id);
			reInitListFuzzySearch();
			listHash = getListHash();
		}
	}

	export function onInsertBeforeListClick(): void {
		items = items.map((s) => ({ ...s, isEdited: false }));
		const newId = '' + new Date().getTime();
		items.unshift({
			id: newId,
			itemDescription: '',
			category: otherCategoryName,
			checked: false,
			selected: false,
			isEdited: true
		});
		items = items
			.map((s) => ({ ...s, isEdited: s.id === newId }))
			.filter((item) => item.isEdited || item.itemDescription?.length > 0);
	}

	export function onItemInsertAfterClick(id: number): void {
		items = items.map((s) => ({ ...s, isEdited: false }));
		const index = items.findIndex((item) => item.id === id);
		const newId = '' + new Date().getTime();
		items.splice(index + 1, 0, {
			id: newId,
			itemDescription: '',
			category: otherCategoryName,
			checked: false,
			selected: false,
			isEdited: true
		});
		items = items
			.map((s) => ({ ...s, isEdited: s.id === newId }))
			.filter((item) => item.isEdited || item.itemDescription?.length > 0);
	}

	export function handleInputSubmit(id: string): void {
		const index = items.findIndex((item) => item.id === id);
		if (index === items.length - 1) {
			const newId = '' + new Date().getTime();
			items.push({
				id: newId,
				itemDescription: '',
				category: otherCategoryName,
				checked: false,
				selected: false,
				isEdited: true
			});
			items = items.map((s) => ({ ...s, isEdited: s.id === newId }));
		} else {
			items = items.map((s) => ({ ...s, isEdited: false }));
		}
		const item = items.find((item) => item.id === id);
		// check for duplicate items
		const currHash = getListHash();
		if (currHash !== listHash && item?.itemDescription?.length) {
			const dups = listFuzzySearch
				.search(item.itemDescription)
				.filter((dup) => dup.item.id !== item.id);
			if (dups?.length) {
				isShowPossibleDuplicateToast = true;
				highlighted = dups.reduce((p, c) => {
					return { ...p, [c.item.id]: true };
				}, {});
				highlighted = { ...highlighted, [item.id]: true };
				setTimeout(() => {
					(isShowPossibleDuplicateToast = false), (highlighted = {});
				}, 5000);
			}
		}
		reInitListFuzzySearch();
		listHash = currHash;

		// try to match category
		if (item?.itemDescription?.length > 1 && item?.category === otherCategoryName) {
			const matchingCategory = findMatchingCategory(item as CheckListItem);
			if (matchingCategory) {
				item.category = matchingCategory;
				items = [...items];
			}
		}
	}

	export function handleInputBlur(id: string): void {
		const item = items.find((item) => item.id === id);
		if (items.length > 1 && item && item?.itemDescription?.length < 1) {
			items = items.filter((s) => s.id !== id);
		}
		// check for duplicate items
		const currHash = getListHash();
		if (currHash !== listHash && item?.itemDescription?.length) {
			const dups = listFuzzySearch
				.search(item.itemDescription)
				.filter((dup) => dup.item.id !== item.id);
			if (dups?.length) {
				isShowPossibleDuplicateToast = true;
				highlighted = dups.reduce((p, c) => {
					return { ...p, [c.item.id]: true };
				}, {});
				highlighted = { ...highlighted, [item.id]: true };
				setTimeout(() => {
					(isShowPossibleDuplicateToast = false), (highlighted = {});
				}, 5000);
			}
		}
		reInitListFuzzySearch();
		listHash = currHash;
		if (item?.itemDescription?.length > 1 && item?.category === otherCategoryName) {
			const matchingCategory = findMatchingCategory(item as CheckListItem);
			if (matchingCategory) {
				item.category = matchingCategory;
				items = [...items];
			}
		}
	}

	export function onCloseAllEdits(): void {
		items = items.map((s) => ({ ...s, selected: false }));
		if (items.length === 1) {
			return;
		}
		items = items.filter((s, ind) => s.itemDescription.length > 0);
	}

	export function onSaveClicked(): void {
		const list = saveList();
		goto(`/home/lists/${list.id}`);
	}

	function findMatchingCategory(item: CheckListItem): string {
		const options = {
			includeScore: true,
			keys: ['itemDescription'],
			shouldSort: true,
			minMatchCharLength: 2,
			threshold: 0.6
		};

		const fuse = new (window as any).Fuse(propositions, options);
		const matches = fuse.search(item.itemDescription);
		if (matches?.length) {
			return matches[0].item?.category;
		}
	}

	function isEmptyList(): boolean {
		return items.length <= 1 && !items[0]?.itemDescription?.length;
	}

	function saveList(): CheckList {
		const listItems: CheckListItem[] = items
			.filter((it) => !!it?.itemDescription?.length)
			.map(
				(it) =>
					({
						id: it.id,
						itemDescription: it.itemDescription,
						category: it.category,
						checked: it.checked || false
					} as CheckListItem)
			);
		const propositionsMap = propositions.reduce((prev, curr) => {
			return { ...prev, [curr.itemDescription]: curr };
		}, {});
		listItems
			.filter((it) => !!it?.itemDescription)
			.forEach(
				(it) =>
					(propositionsMap[it.itemDescription] = {
						itemDescription: it.itemDescription,
						id: it.id,
						category: it.category
					})
			);
		const propositionsToAdd = Object.keys(propositionsMap).map((desc) => propositionsMap[desc]);
		const list: CheckList = {
			id: listId,
			created_utc: new Date().getTime(),
			name: listName,
			items: listItems
		};
		const prevState = getState();
		const oldListData = prevState.listData || {};
		let listIds = prevState.listIds || [];
		listIds = listIds.filter((lId) => lId !== list.id);
		listIds.unshift(list.id);
		const oldCategoryOptions = prevState.categoryOptions || [];
		const newListData: { [id: string]: CheckList } = {
			...oldListData,
			[list.id]: list
		};
		const newPropositions: Proposition[] = [...propositionsToAdd];

		const oldCategoryOptionsMap = oldCategoryOptions.reduce((prev, curr) => {
			return { ...prev, [curr.name]: true };
		}, {});
		const categoryOptionsToAdd = categoryOptions.filter(
			(opt) => !oldCategoryOptionsMap[opt.name] && !opt.id
		);
		const newCategoryOptions: CategoryOption[] = [...categoryOptionsToAdd, ...oldCategoryOptions];
		const newState: KGarooState = {
			...prevState,
			listIds,
			listData: newListData,
			propositions: newPropositions,
			categoryOptions: newCategoryOptions
		};
		setState(newState);
		return list;
	}
</script>

<svelte:head>
	<title>K-garoo - Add checklist</title>
</svelte:head>

<section class="section-container h-screen w-screen flex flex-col">
	<div
		class="flex justify-between items-center sticky-top"
		style="padding-left: 2rem; padding-right: 2rem; padding-top: 1rem; padding-bottom: 5px;"
	>
		<div class="flex items-center" style="height: 25px">
			<ArrowLeft on:click={onBackClicked} class="w-25 h-25" />
		</div>
		<div class="flex items-center left" style="height: 25px">
			{#if isEditListName}
				<form on:submit|preventDefault={onEditListNameSubmit}>
					<input
						id="list-name"
						autofocus
						autocomplete="off"
						type="text"
						bind:value={listName}
						on:blur={onEditListNameSubmit}
					/>
				</form>
			{:else}
				<h3 on:click|stopPropagation={onEditListNameOpen} class="font-medium text-sm sm:text-2xl">
					{listName}
				</h3>
			{/if}
		</div>
		<div class="flex items-center right">
			<button
				on:click|stopPropagation={onShowPropositionsClicked}
				style="width: 42px; height: 42px;"
				class="flex items-center justify-center"
			>
				<DotsHorizontal class="w-25 h-25" />
			</button>
			<Button
				on:click={onSaveClicked}
				style="width: 42px; height: 42px;"
				color="blue"
				class="!p-2 ml-4 flex items-center justify-center"
			>
				<Check class="w-25 h-25" color="white" />
			</Button>
		</div>
	</div>
	{#if isShowPropositions}
		<div class="fixed left-0 top-0 bottom-0 right-0 z-50 text-base">
			<div
				on:click|stopPropagation={onShowPropositionsCloseClicked}
				class="absolute left-0 top-0 bottom-0 right-0 z-40 bg-black opacity-50"
				style="background-color: black"
			/>
			<div
				class="propositions-pane absolute top-0 bottom-0 right-0 bg-white w-80 z-50 px-0.5 py-2 overflow-y-auto"
			>
				<div class="font-medium flex justify-center">Click to add</div>
				{#if !filteredPropositions?.length}
					<div class="flex justify-center items-center text-gray-600 p-6">
						No recent suggestions
					</div>
				{/if}
				{#each filteredPropositions as prop}
					<div
						on:click|stopPropagation={() => onAddPropositionClicked(prop)}
						class="px-2 py-3 flex justify-between"
					>
						<div>
							{prop.itemDescription}
						</div>
						<div class="text-sm text-gray-600">
							{prop.category}
						</div>
					</div>
				{/each}
				<div />
			</div>
		</div>
	{/if}
	<div
		class="scroll-auto flex-1 pr-8 pl-8 pr-8"
		on:click={onCloseAllEdits}
		on:dblclick={onSaveClicked}
		style="padding-bottom: 200px;"
	>
		<div
			on:click|stopPropagation={onInsertBeforeListClick}
			class="insert-before-button"
			style="height: 40px"
		/>
		{#each items as item, index}
			<div
				use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-left pan-y' }}
				on:click|stopPropagation={() => onItemClick(item.id)}
				on:swipe={() => onItemSwipe(item.id, event)}
				class="flex items-center {highlighted[item.id] ? 'bg-blue-100' : ''}"
				style="padding: 5px; border-radius: 7px;"
			>
				<div
					onclick="event.stopPropagation()"
					class="checkbox flex items-center mr-3"
					style="height: 42px;"
				>
					<div class="flex">
						<input
							style="width: 20px; height: 20px;"
							type="checkbox"
							bind:checked={item.selected}
							onclick="event.stopPropagation()"
						/>
					</div>
				</div>
				<div
					class="left space-x-2 flex items-center flex-1"
					style="height: 42px; position: relative"
				>
					{#if item.isEdited}
						<form on:submit|preventDefault={() => handleInputSubmit(item.id)} style="width: 100%">
							<input
								autofocus
								style="box-sizing: border-box; width: 100%"
								on:blur={() => handleInputBlur(item.id)}
								type="text"
								bind:value={item.itemDescription}
							/>
						</form>
					{:else}
						{item.itemDescription}
					{/if}
				</div>
				<div
					onclick="event.stopPropagation()"
					class="checkbox flex items-center justify-end ml-2"
					style="height: 42px;"
				>
					<div on:click={() => onItemCategoryClicked(item.id)} class="text-sm text-gray-600">
						{item.category}
					</div>
				</div>
			</div>
			<div
				on:click|stopPropagation={() => onItemInsertAfterClick(item.id)}
				class="insert-after-button {index === items.length - 1 ? 'last-insert' : ''}"
			/>
		{/each}
	</div>
	{#if isAnyItemsChecked}
		<BottomMenu>
			<div class="flex justify-between items-center">
				<div class="mr-1">
					<Button
						on:click={removeSelectedItems}
						class="!p-2 flex justify-center items-center"
						style="height: 38px; width: 38px"
					>
						<DocumentRemove />
					</Button>
				</div>
				<div>
					<form
						class="flex justify-end items-center z-20"
						on:submit|preventDefault={handleChangeCategoryForSelectedClicked}
					>
						<div class="mr-3 text-xs sm:text-base flex justify-end">Set category to:</div>
						<div class="mr-3" style="width: min-content">
							<select
								class="sm:text-sm"
								style="height: 38px;"
								onclick="event.stopPropagation()"
								bind:value={changeCategoryTo}
							>
								{#each categoryOptions as cOption}
									<option value={cOption.name}>{cOption.name}</option>
								{/each}
							</select>
							{#if isCustomCategoryPopupOpen}
								<input
									class="sm:text-sm mt-1"
									style="height: 38px; display: inline-block; width: 100%; box-sizing: border-box"
									autofocus
									autocomplete="off"
									type="text"
									id="custom-category-input"
									bind:value={customInputCategory}
									placeholder="My category"
								/>
							{/if}
						</div>
						<div class="space-x-2">
							<Button
								class="!p-2 text-white"
								color="blue"
								style="width: 38px; height: 38px;"
								type="submit"
							>
								OK
							</Button>
						</div>
					</form>
				</div>
			</div>
		</BottomMenu>
	{/if}
	{#if isShowPossibleDuplicateToast}
		<div class="absolute left-0 right-0 top-0 flex justify-center z-50">
			<Toast simple={true} class="bg-blue-200"
				>{$t('lists.create_new_list.possible_duplicates')}</Toast
			>
		</div>
	{/if}
</section>

<style>
	.sticky-top {
		position: sticky;
		top: 0;
		background-color: white;
		z-index: 30;
	}
	.insert-after-button {
		height: 22px;
	}
	.last-insert {
		height: 80px;
	}
</style>
