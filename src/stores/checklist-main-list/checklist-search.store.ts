import { derived, get, writable } from 'svelte/store';
import { listDataStore } from '../checklist-details/checklist-details-data';
import { getChecklistSearchIndex } from '../../utils/get-checklist-search-index';

export const listSearchIndices = writable<{ [listId: string]: string }>({});
export const isCreatingIndex = writable<boolean>(false);
export const searchValue = writable<string | null>(null);
export const searchedIds = derived(
	[listSearchIndices, searchValue],
	([indices, search]): { [listId: string]: string } | undefined => {
		if (!search?.length) {
			return undefined;
		}
		const lowercase = search
			.toLowerCase()
			.split(' ')
			.filter((lc) => !!lc.length);
		if (!lowercase.length) {
			return undefined;
		}
		console.log(indices);
		const result: { [listId: string]: string } = {};
		Object.keys(indices)
			.filter((listId) => {
				return lowercase.every((lc) => indices[listId].indexOf(lc) >= 0);
			})
			.forEach((listId) => (result[listId] = listId));
		return result;
	}
);

export async function createChecklistSearchIndices(): Promise<void> {
	isCreatingIndex.set(true);
	requestAnimationFrame(() => {
		const indices: { [listId: string]: string } = {};
		const listData = get(listDataStore);
		Object.keys(listData).forEach(
			(listId) => (indices[listId] = getChecklistSearchIndex(listData[listId]))
		);
		listSearchIndices.set(indices);
		isCreatingIndex.set(false);
	});
}
