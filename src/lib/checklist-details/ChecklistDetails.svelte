<script lang="ts">
	import DetailsPage from '$lib/DetailsPage.svelte';
	import DetailsTopBar from '$lib/DetailsTopBar.svelte';
	import DetailsBody from '$lib/DetailsBody.svelte';
	import BottomMenu from '$lib/BottomMenu.svelte';
	import ChecklistItemEditor from './ChecklistItemEditor.svelte';
	import ChecklistItem from './ChecklistItem.svelte';
	import ChecklistBatchEditor from './ChecklistBatchEditor.svelte';
	import DotMenu from '../DotMenu.svelte';
	import ChecklistDetailsDemoBody from '../checklist-details-demo/ChecklistDetailsDemoBody.svelte';
	import { EyeOff } from 'svelte-heros';
	import { Button, DropdownItem } from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { otherCategoryId } from '../../utils/local-storage-state';
	import { getChecklistGroupedByCategory } from '../../utils/get-checklist-grouped-by-category';
	import { t } from '../../utils/i18n';
	import { Briefcase, Eye, InformationCircle, Link, ListBullet, Plus } from 'svelte-heros-v2';
	import { press } from 'svelte-gestures';
	import { goto } from '$app/navigation';
	import type { FuzzyOptions } from '../../utils/fuzzy-search';
	import { FuzzySearch } from '../../utils/fuzzy-search';
	import type {
		CategoryOption,
		CheckListItemEditModel,
		GroupedByCategoryItem,
		Proposition
	} from '../../types';
	import type { ChangeCategoryEvent } from '../../types/checklist-details';
	import { getUID } from '../../utils/get-uid';
	import TitleWithEdit from '../TitleWithEdit.svelte';
	import FullPageSpinner from '../FullPageSpinner.svelte';
	import { ChecklistDetailsStore } from '../../stores/checklist-details/checklist-details-store';
	import { CategoryAutodetector } from '../../stores/checklist-details/category-autodetector';
	import { copyToClipboard } from '../../utils/copy-to-clipboard';
	import type { ToastManagerType } from '../../utils/toasts';
	import { ToastService } from '../../utils/toasts';
	import { getDecodeLinkToList } from '../../utils/get-decode-link-to-list';
	import { p } from '../../utils/pluralize';
	import { darkEquivalents, pickColorForACategory } from '../../utils/category-colors';
	import ColorSelector from '../ColorSelector.svelte';
	import Palette from '../Palette.svelte';

	export let listId: string | undefined;
	export let locale: 'en' | 'ua';
	let store: ChecklistDetailsStore;
	let categoryAutodetector: CategoryAutodetector;
	let toastManager: ToastManagerType = ToastService.getInstance();
	let listName: string = ($t as any)('lists.create_new_list.header');
	let items: CheckListItemEditModel[] = [];
	let categoryOptions: CategoryOption[] = [];
	let propositions: Proposition[] = [];

	let isLoaded: boolean;
	let isByCategoryView = false;
	let isCheckboxView = false;
	let isColorsForCategories = false;
	let editedItem: CheckListItemEditModel;
	let editedCategoryId: string;
	let isAddToListMode: boolean;
	let addToCategoryId: string;
	let propositionsFuzzySearch: FuzzySearch<Proposition>;
	let isFirstTimeUse = true;
	let isFirstTimeAdded = false;
	let isHideCrossedOut = false;
	// support undo for delete
	let previousItems: CheckListItemEditModel[];
	// animations for remove
	let itemsToBeDeleted: { [id: string]: true } = {};
	let shouldCreateNewList = false;
	const darkBG = darkEquivalents;
	$: displayItems = isHideCrossedOut ? items.filter((it) => !it.checked) : items;
	$: selectCategoryOptions = categoryOptions.map((o) => ({ name: o.name, value: o.id }));
	$: byCategoryList = getChecklistGroupedByCategory(displayItems);
	$: isAnyItemSelected = items.some((it) => it.selected);

	onMount(async () => {
		store = new ChecklistDetailsStore(locale);
		const checklistSettings = await store.getChecklistSettings();
		isByCategoryView = checklistSettings.isGroupByCategory;
		isColorsForCategories = checklistSettings.isColorsForCategories;
		isFirstTimeUse = !checklistSettings.hasSeenDemo;
		categoryOptions = await store.getCategoryOptions();
		propositions = await store.getPropositions();
		categoryAutodetector = new CategoryAutodetector(propositions, locale);
		if (listId) {
			const list = await store.getList(listId);
			if (list) {
				listName = list.name;
				items = list.items.map((it) => ({ ...it, selected: false, isEdited: false }));
			} else {
				shouldCreateNewList = true;
			}
		}
		updatePropositionsFuzzySearch();
		checkListForDuplicates();
		isLoaded = true;
		if (shouldCreateNewList && !isFirstTimeUse) {
			setTimeout(() => {
				onAddToListClicked();
			});
		}
	});

	onDestroy(() => {
		toastManager.clear();
		if (listId) {
			store.setHasSeenDemo();
		}
	});

	function onListTitleSave(): void {
		if (!listId) {
			createNewList();
		} else {
			store.saveListName(listId, listName);
		}
	}

	function onBackClick(): void {
		goto('/home/lists');
	}

	function onBodySwipeLeft(): void {
		if (isCheckboxView) {
			isCheckboxView = false;
			deselectAllCheckboxes();
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
		closeAllEdits();
		isCheckboxView = !isCheckboxView;
		if (!isCheckboxView) {
			deselectAllCheckboxes();
		}
	}

	function onToggleByCategoryViewClicked(): void {
		isByCategoryView = !isByCategoryView;
		store.updateByCategoryView(isByCategoryView);
	}

	function onToggleColorsForCategories(): void {
		isColorsForCategories = !isColorsForCategories;
		store.updateColorsForCategoriesView(isColorsForCategories);
	}

	async function onGenerateListLinkClicked(): Promise<void> {
		const list = await store.getList(listId);
		const url = getDecodeLinkToList(list);
		await copyToClipboard(url);
		toastManager.push({
			text: ($t as any)('lists.details.link-created'),
			closePrevious: false
		});
	}

	function onShowMeAround() {
		closeAllEdits();
		setTimeout(() => (isFirstTimeUse = true));
	}

	function onAddToListClicked(): void {
		isCheckboxView = false;
		deselectAllCheckboxes();
		if (isAddToListMode) {
			closeAllEdits();
		} else {
			editedItem = getNewListItem();
			editedCategoryId = editedItem.category.id;
			isAddToListMode = true;
			addToCategoryId = undefined;
		}
	}

	function onListBodyDoubleClick(): void {
		if (isAddToListMode || isCheckboxView || addToCategoryId || !!editedItem) {
			isCheckboxView = false;
			deselectAllCheckboxes();
			closeAllEdits();
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
			closeAllEdits();
		} else {
			addToCategoryId = cat.id;
			isAddToListMode = false;
			editedItem = getNewListItem(cat);
			editedCategoryId = editedItem.category.id;
		}
	}

	function onCategoryColorSelect(color: string, group: GroupedByCategoryItem): void {
		console.log('selected: ', color, ' ', group);
		group.items.forEach((item) => (item.category.color = color));
		const itemMap = group.items.reduce((p, c) => ({ ...p, [c.id]: c }), {});
		items = items.map((it) => {
			if (itemMap[it.id]) {
				return { ...itemMap[it.id], category: { ...itemMap[it.id].category } };
			}
			return it;
		});
		store.upsertListItems(listId, group.items);
	}

	function onItemClick(item: CheckListItemEditModel): void {
		if (editedItem?.id === item.id) {
			return;
		}
		item.checked = !item.checked;
		updateItemInTheList(item);
		store.upsertListItems(listId, [item]);
	}

	function onItemCheckboxChange(item: CheckListItemEditModel): void {
		if (isCheckboxView) {
			item.selected = !item.selected;
			updateItemInTheList(item);
		}
	}

	function onBodyClick(): void {
		// close all edits
		closeAllEdits();
		if (isCheckboxView) {
			deselectAllCheckboxes();
		}
	}

	function onItemSwipe(item: CheckListItemEditModel, event: any): void {
		const direction = event.detail.direction;
		if (direction === 'left') {
			if (!isCheckboxView) {
				doRemoveItems([item.id]);
			}
		}
	}

	function doRemoveItems(itemIds: string[]): void {
		itemsToBeDeleted = itemIds.reduce((p, c) => ({ ...p, [c]: true }), {}) as {
			[id: string]: true;
		};
		setTimeout(() => {
			previousItems = [...items];
			items = items.filter((it) => !itemsToBeDeleted[it.id]);
			console.log(items);
			store.removeListItems(listId, itemIds);
			updatePropositionsFuzzySearch();
			checkListForDuplicates();
			toastManager.push({
				text: ($t as any)('lists.details.removed-toast'),
				closePrevious: true,
				color: 'success',
				type: 'details-top',
				duration: 3000,
				onCancel: () => {
					items = [...previousItems];
					store.setListItems(listId, items);
					updatePropositionsFuzzySearch();
					checkListForDuplicates();
				}
			});
			itemsToBeDeleted = {};
		}, 400);
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
			const removeIds = items.filter((it) => it.selected).map((it) => it.id);
			doRemoveItems(removeIds);
		}
	}

	function onBatchChangeCategory(e: ChangeCategoryEvent): void {
		previousItems = items.map((it) => ({ ...it, category: { ...it.category } }));
		let categoryId = e.categoryId;
		if (e.newCategory) {
			e.newCategory.color = pickColorForACategory(items, categoryOptions);
			categoryOptions = [e.newCategory, ...categoryOptions];
			categoryId = e.newCategory.id;
			store.addCategoryOption(e.newCategory);
		}
		let category = categoryOptions.find((c) => c.id === categoryId);
		let count = 0;
		items = items.map((it) => {
			if (it.selected) {
				count++;
				it.category = { ...category };
			}
			return it;
		});
		store.upsertListItems(listId, items);
		deselectAllCheckboxes();
		toastManager.push({
			text: ($t as any)('lists.details.changed-category-toast'),
			closePrevious: true,
			color: 'success',
			type: 'details-top',
			duration: 3000,
			onCancel: () => {
				items = [...previousItems];
				store.setListItems(listId, items);
			}
		});
	}

	async function onBatchSaveAsNewList(): Promise<void> {
		if (confirm(($t as any)('lists.details.save-as-new-list-warning'))) {
			const listId = getUID();
			const newItems = items.filter((it) => it.selected);
			const newName = listName + ' > ' + ($p as any)('item', newItems.length);
			await store.createList(listId, newName, newItems);
			goto(`/list-details/${listId}`);
			setTimeout(() => {
				location.reload();
			});
		}
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
			categoryToAdd.color = pickColorForACategory(items, categoryOptions);
			console.log(categoryToAdd);
			categoryOptions = [categoryToAdd, ...categoryOptions];
			editedCategoryId = categoryToAdd.id;
			store.addCategoryOption(categoryToAdd);
		}
		const targetCategory = categoryOptions.find((c) => c.id === editedCategoryId);
		const updated = { ...editedItem, category: { ...targetCategory } };
		if (addToCategoryId) {
			items = [...items, updated];
			addToCategoryId = targetCategory.id;
			editedItem = getNewListItem(targetCategory);
			editedCategoryId = editedItem.category.id;
		} else if (isAddToListMode) {
			items = [...items, updated];
			editedItem = getNewListItem();
			editedCategoryId = editedItem.category.id;
		} else {
			updateItemInTheList(updated);
			editedItem = undefined;
		}
		if (shouldCreateNewList) {
			createNewList();
			shouldCreateNewList = false;
		} else {
			store.upsertListItems(listId, [updated]);
		}
		checkListForDuplicates();
		if (items.find((it) => it.id === updated.id).isDuplicate) {
			toastManager.push({
				text: ($t as any)('lists.details.duplicate-item-badge'),
				duration: 2000,
				closePrevious: true,
				type: 'details-top',
				color: 'warning'
			});
		} else {
			toastManager.push({
				text: ($t as any)('lists.details.added-toast'),
				duration: 2000,
				closePrevious: true,
				type: 'details-top',
				color: 'success'
			});
		}

		updatePropositionsFuzzySearch();
	}

	function onEditorFormDestroyed() {
		isFirstTimeAdded = isFirstTimeUse && items.length > 0;
	}

	function createNewList(): void {
		store.createList(listId, listName, items);
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
			color: 'bg-grey-100',
			name: ($t as any)('lists.create_new_list.other-category')
		};
		return {
			id: getUID(),
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

	function deselectAllCheckboxes(): void {
		items = items.map((it) => ({ ...it, selected: false }));
	}

	function closeAllEdits(): void {
		isAddToListMode = false;
		addToCategoryId = undefined;
		editedItem = undefined;
		editedCategoryId = undefined;
	}

	function checkListForDuplicates(): void {
		let duplicateMap = {};
		items.forEach((item) => {
			const desc = item.itemDescription.toLowerCase().trim();
			if (!duplicateMap[desc]) {
				duplicateMap[desc] = [item];
			} else {
				duplicateMap[desc].push(item);
			}
		});
		Object.keys(duplicateMap).forEach((key) => {
			const group = duplicateMap[key];
			const isDuplicate = group.length > 1;
			group.forEach((item) => (item.isDuplicate = isDuplicate));
		});
		items = [...items];
	}
</script>

{#if isLoaded}
	<DetailsPage>
		<DetailsTopBar on:back-clicked={onBackClick}>
			<div slot="page-title">
				<div class="flex items-center">
					<TitleWithEdit bind:title={listName} on:title-submit={onListTitleSave} />
					<div>
						{#if isHideCrossedOut}
							<EyeOff on:click={() => (isHideCrossedOut = false)} class="ml-3" size="15" />
						{/if}
					</div>
				</div>
			</div>
			<div class="space-x-2 flex items-center" slot="right-content">
				<Button
					class="!p-1.5 w-9 h-9"
					color={isCheckboxView ? 'blue' : 'light'}
					on:click={onToggleCheckboxViewClicked}
				>
					<ListBullet size="23" />
				</Button>
				<Button
					on:click={onAddToListClicked}
					class="!p-1.5 w-9 h-9"
					color={isAddToListMode ? 'blue' : 'light'}
				>
					<Plus size="23" />
				</Button>
				<!--			Right menu-->
				<DotMenu widthClass="w-56">
					<DropdownItem>
						<div
							on:click={() => (isHideCrossedOut = !isHideCrossedOut)}
							class="w-full flex items-center"
						>
							<Button class="!p-1.5 mr-2 w-7 h-7" color={isHideCrossedOut ? 'blue' : 'light'}>
								{#if isHideCrossedOut}
									<EyeOff size="15" />
								{:else}
									<Eye size="15" />
								{/if}
							</Button>
							<div class="whitespace-nowrap">
								{#if isHideCrossedOut}
									{$t('lists.details.show-crossed-out')}
								{:else}
									{$t('lists.details.hide-crossed-out')}
								{/if}
							</div>
						</div>
					</DropdownItem>
					<DropdownItem>
						<div on:click={onToggleByCategoryViewClicked} class="w-full flex items-center">
							<Button class="!p-1.5 mr-2 w-7 h-7" color={isByCategoryView ? 'blue' : 'light'}>
								<Briefcase size="15" variation={isByCategoryView ? 'solid' : 'outline'} />
							</Button>
							<div class="whitespace-nowrap">
								{$t('lists.details.by-category')}
							</div>
						</div>
					</DropdownItem>
					<DropdownItem>
						<div on:click={onToggleColorsForCategories} class="w-full flex items-center">
							<Button class="!p-1.5 mr-2 w-7 h-7" color={isColorsForCategories ? 'blue' : 'light'}>
								<div class="block dark:hidden">
									<Palette color={isColorsForCategories ? 'white' : 'black'} />
								</div>
								<div class="hidden dark:block">
									<Palette color="white" />
								</div>
							</Button>
							<div class="whitespace-nowrap">{$t('lists.details.colors-for-categories')}</div>
						</div>
					</DropdownItem>
					<DropdownItem>
						<div on:click={onGenerateListLinkClicked} class="w-full flex items-center">
							<Button class="!p-1.5 mr-2 w-7 h-7" color="light">
								<Link size="15" />
							</Button>
							{$t('lists.details.link-to-list')}
						</div>
					</DropdownItem>
					<DropdownItem>
						<div on:click={onShowMeAround} class="w-full flex items-center">
							<Button class="!p-1.5 mr-2 w-7 h-7" color="light">
								<InformationCircle size="15" />
							</Button>
							{$t('lists.details.show-me-around')}
						</div>
					</DropdownItem>
				</DotMenu>
				<!--			/Right menu-->
			</div>
		</DetailsTopBar>
		<DetailsBody
			on:body-swipe-left={onBodySwipeLeft}
			on:body-swipe-right={onBodySwipeRight}
			on:dblclick={onListBodyDoubleClick}
		>
			<!--        List-->
			{#if isByCategoryView}
				<!--			By category view-->
				{#each byCategoryList as catItem, catIndex}
					<div
						class="relative rounded-md  bg-{isColorsForCategories && catItem.category.color
							? catItem.category.color
							: 'transparent'} dark:!bg-transparent {catIndex === 0 ? '' : 'mt-6'}"
					>
						<div
							class="absolute top-0 bottom-0 left-0 right-0 hidden dark:block rounded-md -z-10 bg-{isColorsForCategories &&
							catItem.category.color
								? darkBG[catItem.category.color]
								: 'transparent'}"
						/>
						<div onclick="event.stopPropagation()">
							<h5 class="text-gray-600 dark:text-gray-400 text-sm flex items-center">
								<span
									class="p-2"
									use:press={{ timeframe: 400, triggerBeforeFinished: true }}
									on:press|stopPropagation={() => onAddToCategoryClicked(catItem.category)}
								>
									{catItem.category.name}
								</span>
								{#if isColorsForCategories && isCheckboxView}
									<ColorSelector
										id={catItem.category.id}
										selected={catItem.category.color}
										placement={catIndex < 2 ? 'bottom' : 'top'}
										classPrefix="bg-"
										on:select={(event) => onCategoryColorSelect(event.detail.color, catItem)}
									/>
								{/if}
							</h5>
						</div>

						<div class="pl-4">
							{#each catItem.items as item (item.id)}
								<ChecklistItem
									{item}
									{isCheckboxView}
									toBeDeleted={itemsToBeDeleted[item.id]}
									on:swipe={(event) => onItemSwipe(item, event)}
									on:item-click={() => onItemClick(item)}
									on:item-long-press={() => onItemLongPress(item)}
									on:checkbox-change={() => onItemCheckboxChange(item)}
									addClass={item.id === editedItem?.id ? 'bg-blue-100 text-black' : ''}
								/>
							{/each}
						</div>
					</div>
				{/each}
				<!--			/By category view-->
			{:else}
				<!--		Plain view-->
				{#each displayItems as item (item.id)}
					<ChecklistItem
						{item}
						{isCheckboxView}
						toBeDeleted={itemsToBeDeleted[item.id]}
						on:swipe={(event) => onItemSwipe(item, event)}
						on:item-click={() => onItemClick(item)}
						on:item-long-press={() => onItemLongPress(item)}
						on:checkbox-change={() => onItemCheckboxChange(item)}
						addClass={item.id === editedItem?.id ? 'bg-blue-100 text-black' : ''}
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
				{store}
				{categoryAutodetector}
				{isFirstTimeUse}
				on:form-submit={(e) => onAddFormSubmit(e)}
				on:dismiss={onBodyClick}
				on:destroy={onEditorFormDestroyed}
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
				on:batch-save-new-list={onBatchSaveAsNewList}
				on:dismiss={onBodyClick}
			/>
		</BottomMenu>
	{/if}
	<!--		/Batch editing input-->
{:else}
	<FullPageSpinner />
{/if}

<ChecklistDetailsDemoBody currentStep={1} closeOnNext={true} isShown={isFirstTimeUse} />
<ChecklistDetailsDemoBody
	currentStep={2}
	isShown={isFirstTimeAdded}
	on:complete={() => (isFirstTimeUse = false)}
/>
