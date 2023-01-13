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
		moveChecklistItemsSearchedOptions
	],
	([search, all, searched]) => {
		if (search?.length) {
			return searched;
		} else {
			return all;
		}
	}
);
