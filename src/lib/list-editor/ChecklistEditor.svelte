<script lang="ts">
	import { goto } from '$app/navigation';
	import { Check, DocumentRemove, DotsHorizontal } from 'svelte-heros';
	import { navigateBack } from '../../utils/navigate-back';
	import { swipe } from 'svelte-gestures';
	import {
		customCategoryId,
		getState,
		otherCategoryId,
		setState,
		specialCategories
	} from '../../utils/local-storage-state';
	import type {
		CategoryOption,
		CheckList,
		CheckListItem,
		CheckListItemEditModel,
		KGarooState,
		Proposition
	} from '../../types';
	import BottomMenu from '../BottomMenu.svelte';
	import { Alert, Button, Checkbox, Input, Select } from 'flowbite-svelte';
	import { afterUpdate, onMount } from 'svelte';
	import { locale, t, translate } from '../../utils/i18n';
	import DetailsPage from '../DetailsPage.svelte';
	import DetailsTopBar from '../DetailsTopBar.svelte';
	import DetailsBody from '../DetailsBody.svelte';
	import type { ToastManagerType } from '../../utils/toasts';
	import { ToastService } from '../../utils/toasts';
	import RightDrawer from '../RightDrawer.svelte';
	import { getChecklistGroupedByCategory } from '../../utils/get-checklist-grouped-by-category';

	const state: KGarooState = getState();
	export let isHidePropositions = true;
	export let listName: string = translate($locale, 'lists.create_new_list.header');
	const otherCategoryName = translate($locale, 'lists.create_new_list.other-category');
	const customCategoryName = translate($locale, 'lists.create_new_list.create-category');
	export let listId = '' + new Date().getTime() + Math.random();
	let listFuzzySearch: any;
	let listHash: string;
	let showPossibleDuplicateHandler: any;
	let highlighted = {};
	const toastManager: ToastManagerType = ToastService.getInstance();
	onMount(() => {
		reInitListFuzzySearch();
		listHash = getListHash();
		isShowPropositionsInstructions = !state.appInstructions.isAddFromPropositionsViewed;
	});

	afterUpdate(() => {
		if (items?.length === 0) {
			items.push({
				id: '' + new Date().getTime() + Math.random(),
				itemDescription: '',
				isEdited: true,
				checked: false,
				selected: false,
				category: { id: otherCategoryId, name: otherCategoryName }
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

	let isByCategoryView = state?.checklistSettings?.isGroupByCategory;
	$: listByCategory = getChecklistGroupedByCategory(items);

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
	$: categoryOptionsForSelect = categoryOptions.map((o) => ({ value: o.id, name: o.name }));
	export let propositions = state.propositions || [];
	export let items: CheckListItemEditModel[] = [
		{
			id: '' + new Date().getTime() + Math.random(),
			itemDescription: '',
			isEdited: true,
			checked: false,
			selected: false,
			category: { id: otherCategoryId, name: otherCategoryName }
		}
	];

	$: filteredPropositions = propositions.filter((prop) => {
		return !items.some(
			(item) => item.itemDescription === prop.itemDescription && item.category === prop.category
		);
	});

	$: isAnyItemsChecked = items.some((it) => it.selected);

	$: isCustomCategoryPopupOpen = changeCategoryTo === customCategoryId;
	export let changeCategoryTo = '';
	export let customInputCategory = '';

	export function handleChangeCategoryForSelectedClicked(): void {
		if (
			!changeCategoryTo?.length ||
			(changeCategoryTo === customCategoryId && !customInputCategory?.length)
		) {
			items = items.map((it) => ({ ...it, selected: false }));
			changeCategoryTo = '';
			customInputCategory = '';
			return;
		}
		let targetCategory: CategoryOption;
		if (changeCategoryTo === customCategoryId) {
			const prevSame = categoryOptions.find((c) => c.name === customInputCategory);
			if (!prevSame) {
				const newOption = { id: '' + new Date().getTime(), name: customInputCategory };
				categoryOptions.push(newOption);
				categoryOptions = [...categoryOptions];
				targetCategory = newOption;
			} else {
				targetCategory = { ...prevSame };
			}
		} else {
			targetCategory = categoryOptions.find((c) => c.id === changeCategoryTo);
		}
		console.log(targetCategory);
		items = items.map((it) => ({
			...it,
			category: it.selected ? { ...targetCategory } : it.category,
			selected: false
		}));
		changeCategoryTo = '';
		customInputCategory = '';
	}

	function removeSelectedItems(): void {
		if (confirm(($t as any)('lists.create_new_list.remove-selected-warning'))) {
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

	let isShowPropositionsInstructions: boolean;
	export function onShowPropositionsClicked(): void {
		isHidePropositions = false;
		setState({
			...state,
			appInstructions: {
				...state.appInstructions,
				isAddFromPropositionsViewed: true
			}
		});
	}

	export function onShowPropositionsCloseClicked(): void {
		isHidePropositions = true;
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
		items.push(newItem);
		items = items.map((s) => ({ ...s, isEdited: false }));

		checkIfItemDuplicate(newItem);
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

	export function onInsertBeforeListClick(categoryId?: string): void {
		const category = categoryId
			? categoryOptions.find((opt) => opt.id === categoryId)
			: {
					id: otherCategoryId,
					name: otherCategoryName
			  };
		items = items.map((s) => ({ ...s, isEdited: false }));
		const newId = '' + new Date().getTime();
		items.unshift({
			id: newId,
			itemDescription: '',
			category: { ...category },
			checked: false,
			selected: false,
			isEdited: true
		});
		items = items
			.map((s) => ({ ...s, isEdited: s.id === newId }))
			.filter((item) => item.isEdited || item.itemDescription?.length > 0);
	}

	export function onItemInsertAfterClick(id: number, categoryId?: string): void {
		const category = categoryId
			? categoryOptions.find((opt) => opt.id === categoryId)
			: {
					id: otherCategoryId,
					name: otherCategoryName
			  };
		items = items.map((s) => ({ ...s, isEdited: false }));
		const index = items.findIndex((item) => item.id === id);
		const newId = '' + new Date().getTime();
		items.splice(index + 1, 0, {
			id: newId,
			itemDescription: '',
			category: category,
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
				category: { id: otherCategoryId, name: otherCategoryName },
				checked: false,
				selected: false,
				isEdited: true
			});
			items = items.map((s) => ({ ...s, isEdited: s.id === newId }));
		} else {
			items = items.map((s) => ({ ...s, isEdited: false }));
		}
		const item = items.find((item) => item.id === id);
		checkIfItemDuplicate(item);

		// try to match category
		if (item?.itemDescription?.length > 1 && item?.category.name === otherCategoryName) {
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
		checkIfItemDuplicate(item);
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
		toastManager.clear();
		listHash = getListHash();
		const list = saveList();
		goto(`/home/lists/${list.id}`);
	}

	function findMatchingCategory(item: CheckListItem): CategoryOption {
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

	function checkIfItemDuplicate(item: CheckListItem): void {
		// check for duplicate items
		const currHash = getListHash();
		if (currHash !== listHash && item?.itemDescription?.length) {
			const dups = listFuzzySearch
				.search(item.itemDescription)
				.filter((dup) => dup.item.id !== item.id);
			if (dups?.length) {
				highlighted = dups.reduce((p, c) => {
					return { ...p, [c.item.id]: true };
				}, {});
				toastManager.push({
					text: ($t as any)('lists.create_new_list.possible_duplicates'),
					type: 'details-top',
					duration: 5000
				});
				highlighted = { ...highlighted, [item.id]: true };
				showPossibleDuplicateHandler = setTimeout(() => {
					highlighted = {};
				}, 5000);
			}
		}
		reInitListFuzzySearch();
		listHash = currHash;
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
			(opt) => !oldCategoryOptionsMap[opt.name] && !specialCategories[opt.id]
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

<RightDrawer on:backdrop-click={onShowPropositionsCloseClicked} bind:hidden={isHidePropositions}>
	<div class="font-medium flex justify-center">
		{$t('lists.create_new_list.click-to-add')}
	</div>
	{#if isShowPropositionsInstructions}
		<Alert class="mt-4">
			{$t('lists.create_new_list.propositions-instructions')}
		</Alert>
	{/if}

	{#if !filteredPropositions?.length}
		<div class="flex justify-center items-center text-gray-600 p-6">
			{$t('lists.create_new_list.no-recent-suggestions')}
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
</RightDrawer>
<DetailsPage>
	<DetailsTopBar on:back-clicked={onBackClicked}>
		<div slot="page-title">
			{#if isEditListName}
				<form on:submit|preventDefault={onEditListNameSubmit}>
					<Input
						id="list-name"
						autofocus
						autocomplete="off"
						type="text"
						bind:value={listName}
						on:blur={onEditListNameSubmit}
					/>
				</form>
			{:else}
				<h3 on:click|stopPropagation={onEditListNameOpen} class="font-medium text-base sm:text-2xl">
					{listName}
				</h3>
			{/if}
		</div>
		<div slot="right-content" class="flex items-center right" onclick="event.stopPropagation()">
			<Button
				color="light"
				on:click={onShowPropositionsClicked}
				style="width: 42px; height: 42px;"
				class="!p-2 flex items-center justify-center"
			>
				<DotsHorizontal class="w-25 h-25" />
			</Button>
			<Button
				on:click={onSaveClicked}
				style="width: 42px; height: 42px;"
				color="blue"
				class="!p-2 ml-4 flex items-center justify-center"
			>
				<Check class="w-25 h-25" color="white" />
			</Button>
		</div>
	</DetailsTopBar>
	<DetailsBody
		noTopPadding="true"
		on:body-click={onCloseAllEdits}
		on:body-long-press={onSaveClicked}
	>
		{#if isByCategoryView}
			{#each listByCategory as catItem}
				<div>
					<h5 class="text-gray-600 text-sm mt-2">{catItem.category.name}</h5>
				</div>
				<ul>
					<div
						on:click|stopPropagation={() => onInsertBeforeListClick(catItem.category.id)}
						class="insert-before-button"
						style="height: 20px"
					/>
					{#each catItem.items as item, index}
						<div
							use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-left pan-y' }}
							on:click|stopPropagation={() => onItemClick(item.id)}
							on:swipe={() => onItemSwipe(item.id, event)}
							class="!pl-4 flex items-center {highlighted[item.id] ? 'bg-blue-100' : ''}"
							style="padding: 5px; border-radius: 7px;"
						>
							<div
								onclick="event.stopPropagation()"
								class="checkbox flex items-center mr-3"
								style="height: 42px;"
							>
								<div class="flex">
									<Checkbox
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
									<form
										on:submit|preventDefault={() => handleInputSubmit(item.id)}
										style="width: 100%"
									>
										<Input
											id="form-input"
											autofocus
											style="box-sizing: border-box; width: 100%"
											on:blur={() => handleInputBlur(item.id)}
											type="text"
											bind:value={item.itemDescription}
										/>
									</form>
								{:else}
									<div class={item.checked ? 'line-through' : ''}>{item.itemDescription}</div>
								{/if}
							</div>
						</div>
						<div
							on:click|stopPropagation={() => onItemInsertAfterClick(item.id, catItem.category.id)}
							class="insert-after-button {index === items.length - 1 ? 'last-insert' : ''}"
						/>
					{/each}
				</ul>
			{/each}
		{:else}
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
							<Checkbox
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
								<Input
									id="form-input"
									autofocus
									style="box-sizing: border-box; width: 100%"
									on:blur={() => handleInputBlur(item.id)}
									type="text"
									bind:value={item.itemDescription}
								/>
							</form>
						{:else}
							<div class={item.checked ? 'line-through' : ''}>{item.itemDescription}</div>
						{/if}
					</div>
					<div
						onclick="event.stopPropagation()"
						class="checkbox flex items-center justify-end ml-2"
						style="height: 42px;"
					>
						<div on:click={() => onItemCategoryClicked(item.id)} class="text-sm text-gray-600">
							{item.category.name}
						</div>
					</div>
				</div>
				<div
					on:click|stopPropagation={() => onItemInsertAfterClick(item.id)}
					class="insert-after-button {index === items.length - 1 ? 'last-insert' : ''}"
				/>
			{/each}
		{/if}
	</DetailsBody>
</DetailsPage>
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
					<div class="mr-1 sm:mr-3 text-xs sm:text-base flex justify-end text-right">
						{$t('lists.create_new_list.set-category-to')}
					</div>
					<div class="mr-1 sm:mr-3">
						<Select
							class="sm:text-sm"
							style="height: 38px; min-width: max-content"
							onclick="event.stopPropagation()"
							items={categoryOptionsForSelect}
							placeholder="--"
							bind:value={changeCategoryTo}
						/>
						{#if isCustomCategoryPopupOpen}
							<Input
								class="sm:text-sm mt-1"
								style="height: 38px; display: inline-block; width: 100%; box-sizing: border-box"
								autofocus
								autocomplete="off"
								type="text"
								id="custom-category-input"
								bind:value={customInputCategory}
								placeholder={$t('lists.create_new_list.my-category')}
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

<style>
	.insert-after-button {
		height: 22px;
	}
	.last-insert {
		height: 80px;
	}
</style>
