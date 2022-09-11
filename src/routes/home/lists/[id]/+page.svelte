<script lang="ts">
	import DetailsPage from '$lib/DetailsPage.svelte';
	import DetailsTopBar from '$lib/DetailsTopBar.svelte';
	import DetailsBody from '$lib/DetailsBody.svelte';
	import BottomMenu from '$lib/BottomMenu.svelte';
	import ChecklistItemEditor from '../../../../lib/ChecklistItemEditor.svelte';
	import ChecklistItem from '../../../../lib/ChecklistItem.svelte';
	import ChecklistBatchEditor from '../../../../lib/ChecklistBatchEditor.svelte';
	import DotMenu from '../../../../lib/DotMenu.svelte';
	import { Button, DropdownItem } from 'flowbite-svelte';
	import { Briefcase, Link, Plus } from 'svelte-heros';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getState, otherCategoryId } from '../../../../utils/local-storage-state';
	import { getChecklistGroupedByCategory } from '../../../../utils/get-checklist-grouped-by-category';
	import { t } from '../../../../utils/i18n';
	import { ListBullet } from 'svelte-heros-v2';
	import { press } from 'svelte-gestures';
	import { goto } from '$app/navigation';
	import { FuzzySearch } from '../../../../utils/fuzzy-search';
	import type { CategoryOption, CheckListItemEditModel, Proposition } from '../../../../types';
	import type { ChangeCategoryEvent } from '../../../../types/checklist-details';
	import type { FuzzyOptions } from '../../../../utils/fuzzy-search';

	let isByCategoryView = false;
	let isCheckboxView = false;
	let editedItem: CheckListItemEditModel;
	let editedCategoryId: string;
	let isAddToListMode: boolean;
	let addToCategoryId: string;
	let listId: string;
	let listName: string;
	let items: CheckListItemEditModel[] = [];
	let categoryOptions: CategoryOption[] = [];
	let propositions: Proposition[] = [];
	let propositionsFuzzySearch: FuzzySearch<Proposition>;
	$: selectCategoryOptions = categoryOptions.map((o) => ({ name: o.name, value: o.id }));
	$: byCategoryList = getChecklistGroupedByCategory(items);
	$: isAnyItemSelected = items.some((it) => it.selected);

	onMount(() => {
		listId = $page.params.id;
		const state = getState();
		isByCategoryView = state.checklistSettings.isGroupByCategory;
		listName = state.listData[listId].name;
		items = state.listData[listId].items.map((it) => ({ ...it, selected: false, isEdited: false }));
		categoryOptions = state.categoryOptions;
		propositions = state.propositions;
		updatePropositionsFuzzySearch();
	});

	function onBackClick(): void {
		goto('/home/lists');
	}

	function onBodySwipeLeft(): void {
		if (isCheckboxView) {
			isCheckboxView = false;
			items = items.map((it) => ({ ...it, selected: false }));
		}
	}

	function onBodySwipeRight(): void {
		isAddToListMode = false;
		addToCategoryId = undefined;
		editedItem = undefined;
		editedCategoryId = undefined;
		isCheckboxView = true;
	}

	function onToggleCheckboxViewClicked(): void {
		isAddToListMode = false;
		addToCategoryId = undefined;
		editedItem = undefined;
		editedCategoryId = undefined;
		isCheckboxView = !isCheckboxView;
		if (!isCheckboxView) {
			items = items.map((it) => ({ ...it, selected: false }));
		}
	}

	function onToggleByCategoryViewClicked(): void {
		isByCategoryView = !isByCategoryView;
	}

	function onGenerateListLinkClicked(): void {
		console.log('generate clicked');
	}

	function onAddToListClicked(): void {
		isCheckboxView = false;
		if (isAddToListMode) {
			isAddToListMode = false;
			editedItem = undefined;
			editedCategoryId = undefined;
		} else {
			editedItem = getNewListItem();
			editedCategoryId = editedItem.category.id;
			isAddToListMode = true;
			addToCategoryId = undefined;
		}
	}

	function onAddToCategoryClicked(cat: CategoryOption): void {
		if (isCheckboxView) {
			return;
		}
		if (addToCategoryId === cat.id) {
			isAddToListMode = undefined;
			addToCategoryId = undefined;
			editedItem = undefined;
		} else {
			addToCategoryId = cat.id;
			isAddToListMode = false;
			editedItem = getNewListItem(cat);
			editedCategoryId = editedItem.category.id;
		}
	}

	function onItemClick(item: CheckListItemEditModel): void {
		if (editedItem?.id === item.id) {
			return;
		}
		item.checked = !item.checked;
		updateItemInTheList(item);
	}

	function onItemCheckboxChange(item: CheckListItemEditModel): void {
		if (isCheckboxView) {
			item.selected = !item.selected;
			updateItemInTheList(item);
			console.log(items);
		}
	}

	function onBodyClick(): void {
		// close all edits
		isAddToListMode = false;
		addToCategoryId = undefined;
		editedItem = undefined;
		editedCategoryId = undefined;
		if (isCheckboxView) {
			items = items.map((it) => ({ ...it, selected: false }));
		}
	}

	function onItemSwipe(item: CheckListItemEditModel, event: any): void {
		const direction = event.detail.direction;
		if (direction === 'left') {
			if (!isCheckboxView) {
				items = items.filter((it) => it.id !== item.id);
				updatePropositionsFuzzySearch();
			}
		}
	}

	function onItemLongPress(item: CheckListItemEditModel): void {
		if (isCheckboxView) {
			return;
		}
		isAddToListMode = false;
		addToCategoryId = undefined;
		editedItem = { ...item };
		editedCategoryId = editedItem.category.id;
	}

	function onBatchRemove(): void {
		const m = ($t as any)('lists.create_new_list.remove-selected-warning');
		if (confirm(m)) {
			items = items.filter((it) => !it.selected);
			updatePropositionsFuzzySearch();
		}
	}

	function onBatchChangeCategory(e: ChangeCategoryEvent): void {
		let categoryId = e.categoryId;
		if (e.newCategory) {
			categoryOptions = [e.newCategory, ...categoryOptions];
			categoryId = e.newCategory.id;
		}
		let category = categoryOptions.find((c) => c.id === categoryId);
		items = items.map((it) => {
			if (it.selected) {
				it.category = { ...category };
			}
			return it;
		});
	}

	function onAddFormSubmit(e?: any): void {
		if (!editedItem?.itemDescription?.length) {
			editedItem = undefined;
			editedCategoryId = undefined;
			isAddToListMode = false;
			addToCategoryId = undefined;
			return;
		}
		const categoryToAdd: CategoryOption | undefined = e?.detail?.addCategory;
		if (categoryToAdd) {
			categoryOptions = [categoryToAdd, ...categoryOptions];
			editedCategoryId = categoryToAdd.id;
		}
		const targetCategory = categoryOptions.find((c) => c.id === editedCategoryId);
		const updated = { ...editedItem, category: { ...targetCategory } };
		if (addToCategoryId) {
			items = [updated, ...items];
			addToCategoryId = targetCategory.id;
			editedItem = getNewListItem(targetCategory);
			editedCategoryId = editedItem.category.id;
		} else if (isAddToListMode) {
			items = [updated, ...items];
			editedItem = getNewListItem();
			editedCategoryId = editedItem.category.id;
		} else {
			updateItemInTheList(updated);
			editedItem = undefined;
		}
		updatePropositionsFuzzySearch();
	}

	function updateItemInTheList(item: CheckListItemEditModel) {
		items = items.map((it) => {
			if (it.id === item.id) {
				return { ...item };
			} else {
				return it;
			}
		});
	}

	function getNewListItem(category?: CategoryOption): CheckListItemEditModel {
		const targetCategory = category || {
			id: otherCategoryId,
			name: ($t as any)('lists.create_new_list.other-category')
		};
		return {
			id: '' + new Date().getTime(),
			itemDescription: '',
			category: targetCategory,
			checked: false,
			selected: false,
			isEdited: false
		};
	}

	function updatePropositionsFuzzySearch(): void {
		const itemDescriptionMap = items
			.map((it) => it.itemDescription.toLowerCase())
			.reduce((p, c) => ({ ...p, [c]: true }), {});
		const filteredPropositions = propositions.filter((prop) => {
			return !itemDescriptionMap[prop.itemDescription.toLowerCase()];
		});
		const options: FuzzyOptions<Proposition> = {
			keys: ['itemDescription'],
			shouldSort: true,
			threshold: 0.4
		};
		propositionsFuzzySearch = new FuzzySearch<Proposition>(filteredPropositions, options);
	}
</script>

<DetailsPage>
	<DetailsTopBar on:back-clicked={onBackClick}>
		<div slot="page-title">{listName}</div>
		<div class="space-x-2 flex items-center" slot="right-content">
			<Button
				on:click={onToggleByCategoryViewClicked}
				class="!p-2 hidden sm:inline-block"
				color={isByCategoryView ? 'blue' : 'light'}
			>
				<Briefcase variation={isByCategoryView ? 'solid' : 'outline'} />
			</Button>
			<Button
				class="!p-2"
				color={isCheckboxView ? 'blue' : 'light'}
				on:click={onToggleCheckboxViewClicked}
			>
				<ListBullet />
			</Button>
			<Button on:click={onAddToListClicked} class="!p-2" color={isAddToListMode ? 'blue' : 'light'}>
				<Plus />
			</Button>
			<!--			Right menu-->
			<DotMenu>
				<DropdownItem class="block sm:hidden">
					<div on:click={onToggleByCategoryViewClicked} class="w-full flex items-center">
						<Button class="!p-2 mr-2" color={isByCategoryView ? 'blue' : 'light'}>
							<Briefcase size="15" variation={isByCategoryView ? 'solid' : 'outline'} />
						</Button>
						By category
					</div>
				</DropdownItem>
				<DropdownItem>
					<div on:click={onGenerateListLinkClicked} class="w-full flex items-center">
						<Button class="!p-2 mr-2" color="light">
							<Link size="15" />
						</Button>
						Get link to list
					</div>
				</DropdownItem>
			</DotMenu>
			<!--			/Right menu-->
		</div>
	</DetailsTopBar>
	<DetailsBody
		on:body-swipe-left={onBodySwipeLeft}
		on:body-swipe-right={onBodySwipeRight}
		on:dblclick={onAddToListClicked}
	>
		<!--        List-->
		{#if isByCategoryView}
			<!--			By category view-->
			{#each byCategoryList as catItem, catIndex}
				<div onclick="event.stopPropagation()">
					<h5 class="text-gray-600 text-sm flex items-center {catIndex === 0 ? '' : 'pt-6'}">
						<span
							class="p-2"
							use:press={{ timeframe: 400, triggerBeforeFinished: true }}
							on:press|stopPropagation={() => onAddToCategoryClicked(catItem.category)}
						>
							{catItem.category.name}
						</span>
					</h5>
				</div>

				<div class="pl-4">
					{#each catItem.items as item}
						<ChecklistItem
							{item}
							{isCheckboxView}
							on:swipe={(event) => onItemSwipe(item, event)}
							on:mouseup={() => onItemClick(item)}
							on:press={() => onItemLongPress(item)}
							on:checkbox-change={() => onItemCheckboxChange(item)}
							addClass={item.id === editedItem?.id ? 'bg-blue-100' : ''}
						/>
					{/each}
				</div>
			{/each}
			<!--			/By category view-->
		{:else}
			<!--		Plain view-->
			{#each items as item}
				<ChecklistItem
					{item}
					{isCheckboxView}
					on:swipe={(event) => onItemSwipe(item, event)}
					on:mouseup={() => onItemClick(item)}
					on:press={() => onItemLongPress(item)}
					on:checkbox-change={() => onItemCheckboxChange(item)}
					addClass={item.id === editedItem?.id ? 'bg-blue-100' : ''}
				/>
			{/each}
			<!--		/Plain view-->
		{/if}
		<!--        /List-->
	</DetailsBody>
</DetailsPage>
<!--        Bottom input-->
{#if !!editedItem}
	<BottomMenu on:swipe-left={onBodyClick}>
		<ChecklistItemEditor
			{editedItem}
			{isByCategoryView}
			{categoryOptions}
			{propositionsFuzzySearch}
			on:form-submit={(e) => onAddFormSubmit(e)}
			on:dismiss={onBodyClick}
			bind:editedCategoryId
		/>
	</BottomMenu>
{/if}
<!--		/Bottom input-->
<!--		Batch editing input-->
{#if isAnyItemSelected}
	<BottomMenu on:swipe-left={onBodyClick}>
		<ChecklistBatchEditor
			{isByCategoryView}
			{categoryOptions}
			on:batch-remove={onBatchRemove}
			on:batch-change-category={(event) => onBatchChangeCategory(event.detail)}
			on:dismiss={onBodyClick}
		/>
	</BottomMenu>
{/if}
<!--		/Batch editing input-->
