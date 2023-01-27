import { derived, get, writable } from 'svelte/store';
import type { MoveChecklistItemsEvent } from '../../types/move-checklist-items';
import type { CheckListItem, MainListItem } from '../../types';
import { getListItems } from '../checklist-main-list/checklist-main-list-store';
import { getListItemsWithSearch } from '../checklist-main-list/checklist-search.store';

export const moveChecklistItemsEvent = writable<MoveChecklistItemsEvent | null>(null);

export const openMoveChecklistItems = async (
	listId: string,
	items: CheckListItem[]
): Promise<void> => {
	moveChecklistItemsEvent.set({ listId, items });
	await initAllListSearchOptions();
};

export const initAllListSearchOptions = async (): Promise<void> => {
	moveChecklistItemsSearchValue.set(null);
	const allListOptions = await getListItems(true, fetch);
	moveChecklistItemsAllListOptions.set(allListOptions);
};

export const closeMoveChecklistItems = () => {
	moveChecklistItemsEvent.set(null);
};

export const onMoveChecklistItemsSearch = async () => {
	const searchValue = get(moveChecklistItemsSearchValue);
	if (searchValue) {
		const searchedItems = await getListItemsWithSearch(searchValue);
		moveChecklistItemsSearchedOptions.set(searchedItems);
	} else {
		moveChecklistItemsSearchedOptions.set([]);
	}
};

export const moveChecklistItemsSearchValue = writable<string | null>(null);
const moveChecklistItemsAllListOptions = writable<MainListItem[]>([]);
const moveChecklistItemsSearchedOptions = writable<MainListItem[]>([]);
export const moveChecklistItemsListOptions = derived(
	[
		moveChecklistItemsSearchValue,
		moveChecklistItemsAllListOptions,
		moveChecklistItemsSearchedOptions,
		moveChecklistItemsEvent
	],
	([search, all, searched, event]) => {
		const res = search?.length ? searched : all;
		// we don't want to move to the same list
		return res.filter((s) => s.id !== event?.listId);
	}
);
