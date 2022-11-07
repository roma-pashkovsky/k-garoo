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
	import { Duplicate, EyeOff } from 'svelte-heros';
	import { Badge, Button, DropdownItem } from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { otherCategoryId } from '../../utils/local-storage-state';
	import { getChecklistGroupedByCategory } from '../../utils/get-checklist-grouped-by-category';
	import {
		BarsArrowUp,
		Briefcase,
		Eye,
		InformationCircle,
		Link,
		PencilSquare,
		Plus,
		Share
	} from 'svelte-heros-v2';
	import { press } from 'svelte-gestures';
	import { goto } from '$app/navigation';
	import type { FuzzyOptions } from '../../utils/fuzzy-search';
	import { FuzzySearch } from '../../utils/fuzzy-search';
	import type {
		CategoryOption,
		CheckList,
		CheckListItem as CheckListItemType,
		CheckListItemEditModel,
		ChecklistWithSettings,
		GroupedByCategoryItem,
		Proposition
	} from '../../types';
	import type { ChangeCategoryEvent } from '../../types/checklist-details';
	import { getUID } from '../../utils/get-uid';
	import TitleWithEdit from '../TitleWithEdit.svelte';
	import { ChecklistDetailsStore } from '../../stores/checklist-details/checklist-details-store';
	import { CategoryAutodetector } from '../../stores/checklist-details/category-autodetector';
	import type { ToastManagerType } from '../../utils/toasts';
	import { ToastService } from '../../utils/toasts';
	import { getDecodeLinkToList } from '../../utils/get-decode-link-to-list';
	import { darkEquivalents, pickColorForACategory } from '../../utils/category-colors';
	import ColorSelector from '../ColorSelector.svelte';
	import type { Readable, Writable } from 'svelte/store';
	import { derived, get, writable } from 'svelte/store';
	import { t } from '../../stores/app/translate';
	import { p } from '../../stores/app/plurals';
	import { getDefaultListName } from '../../utils/get-default-list-name';
	import { AuthStore } from '../../stores/login/auth.store';
	import { AppSettingsStore, setHasSeenDemo } from '../../stores/app/app-settings';
	import {
		createList,
		setHideCrossedOut,
		setIsGroupedByCategory,
		updateList
	} from '../../stores/checklist-details/checklist-details-data';
	import { getChecklistItemFromEditItem } from '../../utils/get-checklist-item-from-edit-item';
	import { addCategoryOption } from '../../stores/checklist-details/category-options';
	import UsersByListMini from '../UsersByListMini.svelte';
	import {
		propositionStore,
		updatePropositionsWithItems
	} from '../../stores/checklist-details/propositions';
	import { fade } from 'svelte/transition';
	import PasteListener from '../PasteListener.svelte';
	import { parseListFromText } from '../../utils/parse-list-from-text';
	import { shareList } from '../../stores/app/share-list-drawer.store';

	export let listId: string;
	export let list: ChecklistWithSettings | null;
	export let propositions: Readable<Proposition[]>;

	let categoryAutodetector: Readable<CategoryAutodetector>;
	let toastManager: ToastManagerType = ToastService.getInstance();
	let listName: string = list ? list.name : getDefaultListName();
	let items: CheckListItemEditModel[] = list?.items
		? list.items.map((it) => ({ ...it, selected: false, isEdited: false }))
		: [];
	let categoryOptions: Readable<CategoryOption[]>;
	let store: ChecklistDetailsStore;

	let isByCategoryView = list?.isGroupByCategory || false;
	let isCheckboxView = false;
	let editedItem: CheckListItemEditModel | undefined;
	let editedCategoryId: string;
	let isAddToListMode: boolean;
	let addToCategoryId: string;
	let lastAddToCategory: CategoryOption;
	let propositionsFuzzySearchTS: Writable<number> = writable(new Date().getTime());
	let isFirstTimeUse = false;
	let isFirstTimeAdded = false;
	let isHideCrossedOut = list?.hideCrossedOut || false;
	// animations for remove
	let itemsToBeDeleted: { [id: string]: true } = {};
	let shouldCreateNewList = !list;
	let isShareEnabled = AuthStore.isLoggedIn;
	const darkBG = darkEquivalents;
	// paste list functionality
	let pasteDiv: HTMLDivElement;
	$: displayItems = isHideCrossedOut ? items.filter((it) => !it.checked) : items;
	$: selectCategoryOptions = ($categoryOptions || []).map((o) => ({ name: o.name, value: o.id }));
	$: byCategoryList = getChecklistGroupedByCategory(displayItems);
	$: isAnyItemSelected = items.some((it) => it.selected);
	$: isListReadOnly = !shouldCreateNewList && !list?.isMyList;
	let propositionsFuzzySearch: Readable<FuzzySearch<Proposition>>;

	onMount(() => {
		store = new ChecklistDetailsStore(list, get(AppSettingsStore.lang));
		isFirstTimeUse = !get(AppSettingsStore.hasSeenListDemo) && (!list || list?.isMyList);
		categoryOptions = store.categoryOptions;
		propositions = propositionStore;
		categoryAutodetector = store.getCategoryAutoDetector();
		setDataFromList(list);
		propositionsFuzzySearch = derived([propositions, propositionsFuzzySearchTS], ([props, ts]) =>
			getPropositionsFuzzySearch(props)
		);
		checkListForDuplicates();
	});

	async function onAddListToMyCollectionClicked(): Promise<void> {
		const id = await store.addListToMyCollection(list);
		await goto(`/list-details/${id}`);
		setTimeout(() => {
			location.reload();
		});
	}

	onDestroy(() => {
		if (!get(AppSettingsStore.hasSeenListDemo)) {
			setHasSeenDemo();
		}
		toastManager.clear();
	});

	let timeoutHandle: any;
	function setDataFromList(list: CheckList): void {
		if (list) {
			listName = list.name;
			items = list.items.map((it) => ({ ...it, selected: false, isEdited: false }));
			shouldCreateNewList = false;
			if (isByCategoryView) {
				const grouped = getChecklistGroupedByCategory(list.items);
				const lastGroup = grouped[grouped.length - 1];
				lastAddToCategory = lastGroup?.category;
			}
		} else {
			shouldCreateNewList = true;
		}
		if (shouldCreateNewList) {
			if (!isFirstTimeUse && !timeoutHandle) {
				timeoutHandle = setTimeout(() => {
					editedItem = getNewListItem();
					editedCategoryId = editedItem.category.id;
					isAddToListMode = true;
					addToCategoryId = undefined;
				}, 300);
			}
		} else {
			clearTimeout(timeoutHandle);
			closeAllEdits();
		}
	}

	function onListTitleSave(): void {
		if (!shouldCreateNewList) {
			updateList({ id: listId, name: listName });
		}
	}

	function onBackClick(): void {
		goto(`/home/lists?lastVisitedId=${listId}`);
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
		setIsGroupedByCategory(listId, isByCategoryView);
	}

	async function onGenerateListLinkClicked(): Promise<void> {
		let url: string;
		if (get(AuthStore.isLoggedIn)) {
			url = window.origin + '/list-details' + `/${listId}`;
		} else {
			url = getDecodeLinkToList({
				id: listId,
				name: listName,
				isGroupByCategory: isByCategoryView,
				items: items.map((s, i) => {
					return {
						id: s.id,
						itemDescription: s.itemDescription,
						category: s.category,
						checked: s.checked,
						orderAdded: i
					};
				}),
				created_utc: new Date().getTime(),
				updated_utc: new Date().getTime()
			});
		}

		try {
			await navigator.clipboard.writeText(url);
			toastManager.push({
				text: ($t as any)('lists.details.link-created'),
				color: 'success',
				closePrevious: false
			});
		} catch (err) {
			console.error(err);
			toastManager.push({
				text: 'Failed to copy url',
				color: 'warning',
				closePrevious: false
			});
		}
	}

	function onShareClicked(): void {
		shareList(listId);
	}

	function onDuplicateListClicked() {
		if (confirm(get(t)('app.basic-confirm'))) {
			duplicateList();
		}
	}

	async function duplicateList(): Promise<void> {
		const id = getUID();
		const targetItems = items.map((it) => ({ ...it, checked: false } as ChecklistItem));
		const copy = {
			id,
			name: listName,
			items: targetItems
		} as CheckList;
		await createList(copy);
		await goto(`/list-details/${id}`);
		setTimeout(() => location.reload());
	}

	function onShareClickedNoAuth(): void {
		AuthStore.triggerLoginClicked();
	}

	async function onAddAsTextClicked(): Promise<void> {
		try {
			const text = await navigator.clipboard.readText();
			if (text?.length) {
				const parsed = parseListFromText(text);
				await addListItems(parsed);
			} else {
				toastManager.push({
					text: get(t)('lists.details.warning-no-list-in-clipboard'),
					color: 'warning',
					type: 'page-bottom'
				});
			}
		} catch (err) {
			toastManager.push({
				text: get(t)('app.toasts.failed'),
				color: 'warning',
				type: 'page-bottom'
			});
			console.error(err);
		}
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
		if (isListReadOnly) {
			return;
		}
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
		group.items.forEach((item) => (item.category.color = color));
		const itemMap = group.items.reduce((p, c) => ({ ...p, [c.id]: c }), {});
		items = items.map((it) => {
			if (itemMap[it.id]) {
				return { ...itemMap[it.id], category: { ...itemMap[it.id].category } };
			}
			return it;
		});
		const updated = group.items.reduce((p, c) => ({ ...p, [c.id]: { category: c.category } }), {});
		updateList({ id: listId, items: { updated } });
	}

	function onItemClick(item: CheckListItemEditModel): void {
		if (editedItem?.id === item.id) {
			return;
		}
		item.checked = !item.checked;
		updateItemInTheList(item);
		updateList({ id: listId, items: { updated: { [item.id]: { checked: item.checked } } } });
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

	function onItemSwipeLeft(item: CheckListItemEditModel): void {
		if (!isCheckboxView) {
			doRemoveItems([item.id]);
		}
	}

	function doRemoveItems(itemIds: string[]): void {
		itemsToBeDeleted = itemIds.reduce((p, c) => ({ ...p, [c]: true }), {}) as {
			[id: string]: true;
		};
		const previousItems = [...items];
		setTimeout(() => {
			items = items.filter((it) => !itemsToBeDeleted[it.id]);
			updateList({ id: listId, items: { removed: itemIds } });
			updatePropositionsFuzzySearch();
			checkListForDuplicates();
			const wereDeleted = { ...itemsToBeDeleted };
			toastManager.push({
				text: ($t as any)('lists.details.removed-toast'),
				closePrevious: true,
				color: 'success',
				type: 'details-top',
				duration: 3000,
				onCancel: () => {
					items = [...previousItems];
					const toAdd = previousItems
						.filter((it) => wereDeleted[it.id])
						.map((s) => getChecklistItemFromEditItem(s));
					updateList({ id: listId, items: { added: toAdd } });
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
		const previousItems = items.map((it) => ({ ...it, category: { ...it.category } }));
		let category: CategoryOption;
		if (e.newCategory) {
			const compareName = e.newCategory.name.toLowerCase();
			const alreadyAdded = $categoryOptions.find((opt) => opt.name.toLowerCase() === compareName);
			if (!alreadyAdded) {
				e.newCategory.color = pickColorForACategory(items, $categoryOptions);
				addCategoryOption(e.newCategory);
				category = e.newCategory;
			} else {
				category = alreadyAdded;
			}
		} else {
			category = $categoryOptions.find((c) => c.id === e.categoryId);
		}
		if (!category.color) {
			category.color = pickColorForACategory(items, $categoryOptions);
		}
		let count = 0;
		const changed: any = {};
		const changedItems = [];
		items = items.map((it) => {
			if (it.selected) {
				changed[it.id] = { category };
				it.category = { ...category };
				changedItems.push(it);
				count++;
			}
			return it;
		});
		updateList({
			id: listId,
			items: {
				updated: {
					...changed
				}
			}
		});
		updatePropositionsWithItems(changedItems);
		deselectAllCheckboxes();
		toastManager.push({
			text: ($t as any)('lists.details.changed-category-toast'),
			closePrevious: true,
			color: 'success',
			type: 'details-top',
			duration: 3000,
			onCancel: () => {
				const updated = {};
				previousItems.forEach((pr) => {
					if (changed[pr.id]) {
						updated[pr.id] = {
							category: pr.category
						};
					}
				});
				items = [...previousItems];
				updateList({ id: listId, items: { updated } });
			}
		});
	}

	async function onBatchSaveAsNewList(): Promise<void> {
		if (confirm(($t as any)('lists.details.save-as-new-list-warning'))) {
			const listId = getUID();
			const newItems = items.filter((it) => it.selected);
			const newName = listName + ' > ' + ($p as any)('item', newItems.length);
			await createList({ id: listId, name: newName, items: newItems });
			await goto(`/list-details/${listId}`);
			setTimeout(() => {
				location.reload();
			});
		}
	}

	async function onBatchCopyItems(): Promise<void> {
		const selected = items.filter((it) => it.selected);
		const text = selected.map((it) => `■  ${it.itemDescription}`).join('\n');
		try {
			await navigator.clipboard.writeText(text);
			toastManager.push({
				text: ($t as any)('lists.details.items-copies'),
				color: 'success',
				closePrevious: false,
				type: 'details-top'
			});
		} catch (err) {
			toastManager.push({
				text: ($t as any)('app.toasts.failed'),
				color: 'warning',
				closePrevious: false,
				type: 'details-top'
			});
		}
	}

	function onBodyFocus(): void {
		if (pasteDiv) {
			pasteDiv.focus();
		}
	}

	async function onPasteText(event): Promise<void> {
		const pasteEvent = event?.detail as ClipboardEvent;
		if (pasteEvent && pasteEvent.clipboardData) {
			const text = pasteEvent.clipboardData.getData('text/plain');
			if (text && text.length) {
				try {
					const parsed = parseListFromText(text);
					await addListItems(parsed);
				} catch (err) {
					toastManager.push({
						text: get(t)('app.toasts.failed'),
						color: 'warning',
						type: 'page-bottom'
					});
					console.error(err);
				}
			}
		}
	}

	async function addListItems(addItems: CheckListItemType[]): Promise<void> {
		const prevLen = items.length;
		addItems.forEach((it, ind) => (it.orderAdded = (prevLen + ind) * 1000));
		if (addItems.length) {
			if (list) {
				list = await updateList({ id: listId, items: { added: addItems } });
			} else {
				const prev = items.map((s) => getChecklistItemFromEditItem(s));
				list = await createList({ id: listId, name: listName, items: [...prev, ...addItems] });
			}
			setDataFromList(list);
			checkListForDuplicates();
			updatePropositionsWithItems(items);
			toastManager.push({
				text: get(t)('app.toasts.success'),
				color: 'success',
				type: 'page-bottom',
				duration: 5000,
				onCancel: async () => {
					list = await updateList({ id: listId, items: { removed: addItems.map((s) => s.id) } });
					setDataFromList(list);
					checkListForDuplicates();
				}
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
		let targetCategory: CategoryOption;
		const categoryToAdd: CategoryOption | undefined = e?.detail?.addCategory;
		if (categoryToAdd) {
			const compareName = categoryToAdd.name.toLowerCase();
			const alreadyAdded = $categoryOptions.find((c) => c.name.toLowerCase() === compareName);
			if (!alreadyAdded) {
				categoryToAdd.color = pickColorForACategory(items, $categoryOptions);
				editedCategoryId = categoryToAdd.id;
				addCategoryOption(categoryToAdd);
				targetCategory = categoryToAdd;
			} else {
				targetCategory = alreadyAdded;
			}
		} else {
			targetCategory = $categoryOptions.find((c) => c.id === editedCategoryId);
		}
		if (!targetCategory.color) {
			targetCategory.color = pickColorForACategory(items, $categoryOptions);
		}
		const updated = { ...editedItem, category: { ...targetCategory } };
		lastAddToCategory = targetCategory;
		if (addToCategoryId) {
			items = [...items, updated];
			if (!shouldCreateNewList) {
				updateList({ id: listId, items: { added: [getChecklistItemFromEditItem(updated)] } });
			}
			addToCategoryId = targetCategory.id;
			editedItem = getNewListItem(targetCategory);
			editedCategoryId = editedItem.category.id;
		} else if (isAddToListMode) {
			items = [...items, updated];
			if (!shouldCreateNewList) {
				updateList({ id: listId, items: { added: [getChecklistItemFromEditItem(updated)] } });
			}
			editedItem = getNewListItem();
			editedCategoryId = editedItem.category.id;
		} else {
			updateItemInTheList(updated);
			if (!shouldCreateNewList) {
				updateList({
					id: listId,
					items: {
						updated: {
							[updated.id]: {
								id: updated.id,
								itemDescription: updated.itemDescription,
								category: updated.category
							}
						}
					}
				});
			}
			editedItem = undefined;
		}
		updatePropositionsWithItems([updated]);
		if (shouldCreateNewList) {
			createNewList();
			updatePropositionsWithItems(items);
			shouldCreateNewList = false;
		}
		checkListForDuplicates();
		if (items.find((it) => it.id === updated.id)?.isDuplicate) {
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

	async function createNewList(): Promise<void> {
		list = await createList({ id: listId, name: listName, items });
		listName = list.name;
		items = list.items.map((it) => ({ ...it, selected: false, isEdited: false }));
		shouldCreateNewList = false;
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
		const targetCategory = category ||
			lastAddToCategory || {
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
			isEdited: false,
			orderAdded: items.length + 1
		};
	}

	function updatePropositionsFuzzySearch(): void {
		propositionsFuzzySearchTS.set(new Date().getTime());
	}

	function getPropositionsFuzzySearch(props: Proposition[]): FuzzySearch<Proposition> {
		const itemDescriptionMap = items
			.map((it) => it.itemDescription.toLowerCase())
			.reduce((p, c) => ({ ...p, [c]: true }), {});
		const filteredPropositions = (props || []).filter((prop) => {
			return !itemDescriptionMap[prop.itemDescription.toLowerCase()];
		});
		const options: FuzzyOptions<Proposition> = {
			keys: ['itemDescription'],
			shouldSort: true,
			threshold: 0.4
		};
		return new FuzzySearch<Proposition>(filteredPropositions, options);
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

	async function onToggleHideCrossedOut(): Promise<void> {
		isHideCrossedOut = !isHideCrossedOut;
		setHideCrossedOut(listId, isHideCrossedOut);
	}
</script>

<DetailsPage>
	<DetailsTopBar on:back-clicked={onBackClick}>
		<div slot="page-title">
			<div class="flex items-center">
				<TitleWithEdit bind:title={listName} on:title-submit={onListTitleSave} />
			</div>
		</div>
		<div class="space-x-2 flex items-center" slot="right-content">
			{#if !isListReadOnly && items?.length}
				<div in:fade class="space-x-2 flex items-center">
					<Button
						class="!p-1.5 w-9 h-9"
						color={isCheckboxView ? 'blue' : 'light'}
						on:click={onToggleCheckboxViewClicked}
					>
						<PencilSquare size="23" />
					</Button>
					<Button
						on:click={onToggleHideCrossedOut}
						class="!p-1.5 mr-2 w-9 h-9"
						color={isHideCrossedOut ? 'blue' : 'light'}
					>
						{#if isHideCrossedOut}
							<EyeOff size="15" />
						{:else}
							<Eye size="15" />
						{/if}
					</Button>
				</div>
			{/if}
			<!--			Right menu-->
			{#if !isListReadOnly}
				<DotMenu widthClass="w-56">
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
						{#if $isShareEnabled}
							<div on:click={onShareClicked} class="w-full flex items-center">
								<Button class="!p-1.5 mr-2 w-7 h-7" color="light">
									<Share size="15" />
								</Button>
								{$t('lists.details.share-list')}
							</div>
						{:else}
							<div on:click={onShareClickedNoAuth} class="w-full flex items-center">
								<Button class="!p-1.5 mr-2 w-7 h-7" color="light">
									<Share size="15" />
								</Button>
								{$t('lists.details.share-list')}
								<Badge color="purple" class="ml-2">
									{$t('lists.details.share-list-login')}
								</Badge>
							</div>
						{/if}
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
						<div on:click={onDuplicateListClicked} class="w-full flex items-center">
							<Button class="!p-1.5 mr-2 w-7 h-7" color="light">
								<Duplicate size="15" />
							</Button>
							{$t('lists.details.duplicate')}
						</div>
					</DropdownItem>
					<DropdownItem>
						<div on:click={onAddAsTextClicked} class="w-full flex items-center">
							<Button class="!p-1.5 mr-2 w-7 h-7" color="light">
								<BarsArrowUp size="15" />
							</Button>
							{$t('lists.details.add-as-text')}
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
			{/if}

			<!--			/Right menu-->
		</div>
	</DetailsTopBar>
	<DetailsBody
		on:body-swipe-left={onBodySwipeLeft}
		on:body-swipe-right={onBodySwipeRight}
		on:dbltap={onListBodyDoubleClick}
		on:focus={onBodyFocus}
	>
		<!--        List-->
		{#if isByCategoryView}
			<!--			By category view-->
			{#each byCategoryList as catItem, catIndex}
				<div
					class="relative rounded-md  bg-{catItem.category.color
						? catItem.category.color
						: 'transparent'} dark:!bg-transparent {catIndex === 0 ? '' : 'mt-6'}"
				>
					<div
						class="absolute top-0 bottom-0 left-0 right-0 hidden dark:block rounded-md -z-10 bg-{catItem
							.category.color
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
							{#if isByCategoryView && isCheckboxView}
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
								on:swiped-left={() => onItemSwipeLeft(item)}
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
					on:swiped-left={() => onItemSwipeLeft(item)}
					on:item-click={() => onItemClick(item)}
					on:item-long-press={() => onItemLongPress(item)}
					on:checkbox-change={() => onItemCheckboxChange(item)}
					addClass={item.id === editedItem?.id ? 'bg-blue-100 text-black' : ''}
				/>
			{/each}
			<!--		/Plain view-->
		{/if}
		<!--        /List-->
		<!--		Add item button-->
		<svelte:fragment slot="float">
			{#if !isListReadOnly}
				<div class="md:hidden absolute bottom-8 right-8">
					{#if !editedItem}
						<Button class="!p-2" on:click={onAddToListClicked} color="blue">
							<Plus />
						</Button>
					{/if}
				</div>

				<div class="hidden md:block absolute top-8 right-8">
					{#if !editedItem}
						<Button class="!p-2" on:click={onAddToListClicked} color="blue">
							<Plus />
						</Button>
					{/if}
				</div>
			{/if}
			<!--Add list to user's collection-->
			{#if isListReadOnly}
				<div
					class="absolute top-0 bottom-0 left-0 right-0 flex flex-col justify-end z-20"
					onmousedown="event.stopPropagation(); event.preventDefault()"
				>
					<div class="w-full flex justify-end py-4 px-4">
						<Button on:click={onAddListToMyCollectionClicked}
							>{$t('lists.details.add-to-my-lists-button')}</Button
						>
					</div>
				</div>
			{/if}
			<!--EOF Add list to user's collection-->
			<!--			Users by list for mini screens-->
			<div class="absolute top-4 right-4 md:right-8 md:top-24">
				<UsersByListMini {listId} border="true" />
			</div>
		</svelte:fragment>
	</DetailsBody>
</DetailsPage>
<!--        Bottom input-->
{#if !!editedItem}
	<BottomMenu on:swipe-left={onBodyClick}>
		<ChecklistItemEditor
			{editedItem}
			{isByCategoryView}
			shouldAutodetectCategory={!addToCategoryId}
			categoryOptions={$categoryOptions}
			propositionsFuzzySearch={$propositionsFuzzySearch}
			categoryAutodetector={$categoryAutodetector}
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
			categoryOptions={$categoryOptions}
			on:batch-remove={onBatchRemove}
			on:batch-change-category={(event) => onBatchChangeCategory(event.detail)}
			on:batch-save-new-list={onBatchSaveAsNewList}
			on:batch-copy-items={onBatchCopyItems}
			on:dismiss={onBodyClick}
		/>
	</BottomMenu>
{/if}
<!--		/Batch editing input-->

<ChecklistDetailsDemoBody currentStep={1} closeOnNext={true} isShown={isFirstTimeUse} />
<ChecklistDetailsDemoBody
	currentStep={2}
	isShown={isFirstTimeAdded}
	on:complete={() => (isFirstTimeUse = false)}
/>

<!--Paste event listener. Enables CTRL+V paste items, Hide for mobile -->
<div class="hidden md:block">
	<PasteListener bind:pasteDiv on:paste={onPasteText} />
</div>
