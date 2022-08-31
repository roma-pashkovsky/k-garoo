<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, DotsHorizontal, Check } from 'svelte-heros';
	import { navigateBack } from '../../../../utils/navigate-back';
	import { swipe } from 'svelte-gestures';
	import { getState, setState } from '../../../../utils/local-storage-state';
	import type {
		CategoryOption,
		CheckList,
		CheckListItem,
		KGarooState,
		Proposition
	} from '../../../../types';

	const state = getState();
	export let isShowPropositions = false;
	export let listName = 'New list';
	export let isEditListName = false;
	export function onEditListNameOpen(): void {
		isEditListName = true;
	}
	export function onEditListNameSubmit(): void {
		isEditListName = false;
	}
	export let categoryOptions = state.categoryOptions || [
		{
			name: 'Other'
		},
		{
			name: 'Custom'
		}
	];
	export let propositions = state.propositions || [];
	export let items = [
		{
			id: 1,
			itemDescription: '',
			isEdited: true,
			checked: false,
			category: 'Other'
		}
	];

	$: filteredPropositions = propositions.filter((prop) => {
		return !items.some(
			(item) => item.itemDescription === prop.itemDescription && item.category === prop.category
		);
	});

	$: isAnyItemsChecked = items.some((it) => it.checked);

	export let changeCategoryTo = '';
	export let customInputCategory = '';

	export function submitCustomCategory(id: string): void {
		const item = items.find((s) => s.id === id);
		item.category = customInputCategory;
		item.isEdited = false;
		if (!categoryOptions.some((c) => c.name === customInputCategory)) {
			categoryOptions.push({ name: customInputCategory });
		}
		customInputCategory = '';
		items = items.map((s) => ({ ...s }));
		categoryOptions = categoryOptions.map((c) => ({ ...c }));
	}

	export function onBackClicked(): void {
		if (items.length > 1) {
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
		items.push({
			id: new Date().getTime(),
			itemDescription: prop.itemDescription,
			category: prop.category,
			checked: false,
			isEdited: false
		});
		items = items.map((s) => ({ ...s }));
	}

	export function onItemClick(id: string): void {
		items = items.map((source) => {
			return { ...source, isEdited: id === source.id };
		});
		if (items.length > 1) {
			items = items.filter((item) => item.isEdited || item.itemDescription?.length > 0);
		}
	}

	export function onItemCategoryClicked(id: string): void {
		items = items.map((s) => ({ ...s, checked: id === s.id ? !s.checked : s.checked }));
	}

	export function onItemSwipe(id: string, event): void {
		if (event.detail.direction === 'left') {
			items = items.filter((item) => item.id !== id);
		}
	}

	export function onInsertBeforeListClick(): void {
		items = items.map((s) => ({ ...s, isEdited: false }));
		const newId = new Date().getTime();
		items.unshift({
			id: newId,
			itemDescription: '',
			category: 'Other',
			checked: false,
			isEdited: true
		});
		items = items
			.map((s) => ({ ...s, isEdited: s.id === newId }))
			.filter((item) => item.isEdited || item.itemDescription?.length > 0);
	}

	export function onItemInsertAfterClick(id: number): void {
		items = items.map((s) => ({ ...s, isEdited: false }));
		const index = items.findIndex((item) => item.id === id);
		const newId = new Date().getTime();
		items.splice(index + 1, 0, {
			id: newId,
			itemDescription: '',
			category: 'Other',
			checked: false,
			isEdited: true
		});
		items = items
			.map((s) => ({ ...s, isEdited: s.id === newId }))
			.filter((item) => item.isEdited || item.itemDescription?.length > 0);
	}

	export function handleInputSubmit(id: string): void {
		const index = items.findIndex((item) => item.id === id);
		if (items[index].category === 'Custom') {
			submitCustomCategory(id);
		}
		if (index === items.length - 1) {
			const newId = new Date().getTime();
			items.push({
				id: newId,
				itemDescription: '',
				category: 'Other',
				checked: false,
				isEdited: true
			});
			items = items.map((s) => ({ ...s, isEdited: s.id === newId }));
		} else {
			items = items.map((s) => ({ ...s, isEdited: false }));
		}
	}

	export function handleInputBlur(id: string): void {
		const item = items.find((item) => item.id === id);
		if (items.length > 1 && item && item?.itemDescription?.length < 1) {
			items = items.filter((s) => s.id !== id);
		}
	}

	export function onCloseAllEdits(): void {
		if (items.length === 1) {
			return;
		}
		items = items
			.map((s) => ({ ...s, isEdited: false }))
			.filter((s, ind) => s.itemDescription.length > 0);
	}

	export function handleChangeCategoryForSelectedClicked(): void {
		if (changeCategoryTo === 'Custom') {
			if (!categoryOptions.some((c) => c.name === customInputCategory)) {
				categoryOptions.push({ name: customInputCategory });
			}
			changeCategoryTo = customInputCategory;
			categoryOptions = [...categoryOptions];
		}
		items.forEach((item) => {
			if (item.checked) {
				item.category = changeCategoryTo;
			}
		});
		items = items.map((it) => ({ ...it, checked: false }));
		changeCategoryTo = undefined;
		customInputCategory = undefined;
	}

	export function onSaveClicked(): void {
		const list = saveList();
		goto(`/home/lists/${list.id}`);
	}

	function saveList(): CheckList {
		const listItems: CheckListItem[] = items.map(
			(it) =>
				({
					id: it.id,
					itemDescription: it.itemDescription,
					category: it.category,
					checked: false
				} as CheckListItem)
		);
		const propositionsMap = propositions.reduce((prev, curr) => {
			return { ...prev, [curr.itemDescription]: true };
		}, {});
		const propositionsToAdd = listItems
			.filter((it) => !propositionsMap[it.itemDescription])
			.map((it) => ({ itemDescription: it.itemDescription, id: it.id, category: it.category }));
		const list: CheckList = {
			id: 'abc' + new Date().getTime() + Math.random(),
			created_utc: new Date().getTime(),
			name: listName,
			items: listItems
		};
		const prevState = getState();
		const oldListData = prevState.listData || {};
		const listIds = prevState.listIds || [];
		const oldPropositions = prevState.propositions || [];
		const oldCategoryOptions = prevState.categoryOptions || [];
		const newListData: { [id: string]: CheckList } = {
			...oldListData,
			[list.id]: list
		};
		listIds.unshift(list.id);
		const newPropositions: Proposition[] = [...propositionsToAdd, ...oldPropositions];

		const oldCategoryOptionsMap = oldCategoryOptions.reduce((prev, curr) => {
			return { ...prev, [curr.name]: true };
		}, {});
		const categoryOptionsToAdd = categoryOptions.filter((opt) => !oldCategoryOptionsMap[opt.name]);
		const newCategoryOptions: CategoryOption[] = [...categoryOptionsToAdd, ...oldCategoryOptions];
		const newState: KGarooState = {
			listIds,
			listData: newListData,
			propositions: newPropositions,
			categoryOptions: newCategoryOptions
		};
		setState(newState);
		return list;
	}
</script>

<section class="section-container h-screen w-screen flex flex-col">
	<div
		class="flex justify-between items-center"
		style="padding-left: 2rem; padding-right: 2rem; padding-top: 1rem;"
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
						type="text"
						bind:value={listName}
						on:blur={onEditListNameSubmit}
					/>
				</form>
			{:else}
				<h3 on:click|stopPropagation={onEditListNameOpen} class="font-medium text-2xl">
					{listName}
				</h3>
			{/if}
		</div>
		<div class="flex items-center right">
			<button
				on:click={onShowPropositionsClicked}
				style="width: 42px; height: 42px;"
				class="flex items-center justify-center"
			>
				<DotsHorizontal class="w-25 h-25" />
			</button>
			<button
				on:click={onSaveClicked}
				style="width: 42px; height: 42px;"
				class="ml-4 flex items-center justify-center bg-blue-700 rounded-sm"
			>
				<Check class="w-25 h-25" color="white" />
			</button>
		</div>
	</div>
	{#if isShowPropositions}
		<div class="fixed left-0 top-0 bottom-0 right-0 z-50 text-base">
			<div
				on:click={onShowPropositionsCloseClicked}
				class="absolute left-0 top-0 bottom-0 right-0 z-40 bg-black opacity-50"
				style="background-color: black"
			/>
			<div class="propositions-pane absolute top-0 bottom-0 right-0 bg-white w-80 z-50 p-0.5">
				{#if !filteredPropositions?.length}
					<div class="flex justify-center items-center text-gray-600 p-6">
						No recent suggestions
					</div>
				{/if}
				{#each filteredPropositions as prop}
					<div
						on:click={() => onAddPropositionClicked(prop)}
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
		style="padding-bottom: 200px;"
	>
		<div
			on:click|stopPropagation={onInsertBeforeListClick}
			class="insert-before-button"
			style="height: 40px"
		/>
		{#each items as item}
			<div
				use:swipe={{ timeframe: 300, minSwipeDistance: 100, touchAction: 'pan-left pan-y' }}
				on:click|stopPropagation={() => onItemClick(item.id)}
				on:swipe={() => onItemSwipe(item.id, event)}
				class="flex items-center"
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
							bind:checked={item.checked}
							onclick="event.stopPropagation()"
						/>
					</div>
				</div>
				<div class="left space-x-2 flex items-center flex-1" style="height: 42px;">
					{#if item.isEdited}
						<form on:submit|preventDefault={() => handleInputSubmit(item.id)}>
							<input
								autofocus
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
				class="insert-after-button"
				style="height: 20px"
			/>
		{/each}
	</div>
	{#if isAnyItemsChecked}
		<div
			class="fixed bottom-0 left-0 right-0 bg-white p-4 flex justify-end items-center z-20"
			style="box-shadow: 0px -2px 12px -1px rgba(0,0,0,0.41);"
		>
			<div class="mr-3">Change category to:</div>
			<div class="mr-3">
				<select
					style="height: 42px;"
					onclick="event.stopPropagation()"
					bind:value={changeCategoryTo}
				>
					{#each categoryOptions as cOption}
						<option value={cOption.name}>{cOption.name}</option>
					{/each}
				</select>
				{#if changeCategoryTo === 'Custom'}
					<form
						id="custom-category-form"
						class="mt-2"
						on:submit|preventDefault={handleChangeCategoryForSelectedClicked}
					>
						<input
							style="height: 42px; display: block; width: 129px;"
							onclick="event.stopPropagation()"
							autocomplete="off"
							type="text"
							id="custom-category-input"
							bind:value={customInputCategory}
							placeholder="My category"
						/>
					</form>
				{/if}
			</div>
			<div class="space-x-2">
				<button
					style="width: 40px; height: 42px; border-radius: 3px; background-color: #1C64F2; color: white"
					on:click={handleChangeCategoryForSelectedClicked}
				>
					OK
				</button>
			</div>
		</div>
	{/if}
</section>
