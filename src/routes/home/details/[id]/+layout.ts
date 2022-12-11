import type { LoadEvent } from '@sveltejs/kit';
import type { ChecklistDetailsLoadData } from './checklist-details-load-data';
import { loadUserIfNotResolved } from '../../../../stores/login/auth';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import {
	loadList,
	getListIdByParentListId,
	listDataStore
} from '../../../../stores/checklist-details/checklist-details-data';

export async function load(event: LoadEvent): Promise<ChecklistDetailsLoadData | undefined> {
	await loadUserIfNotResolved(event.fetch, browser);
	const listId: string = event.params.id as string;
	let list = get(listDataStore)[listId];
	if (!list) {
		list = await loadList(listId, browser, event.fetch);
	} else {
		console.log('fetched list from cache');
	}
	return {
		listId,
		list,
		childListId: await getListIdByParentListId(listId, browser, event.fetch)
	};
}
