import type { ChecklistDetailsLoadData } from './checklist-details-load-data';
import type { LoadEvent } from '@sveltejs/kit';
import { browser } from '$app/environment';
import {
	getList,
	getListIdByParentListId,
	listDataStore
} from '../../../../../stores/checklist-details/checklist-details-data';
import { get } from 'svelte/store';
import { loadUserIfNotResolved } from '../../../../../stores/login/auth';

export async function load(event: LoadEvent): Promise<ChecklistDetailsLoadData | undefined> {
	await loadUserIfNotResolved(event.fetch, browser);
	const listId: string = event.params.id as string;
	let list = get(listDataStore)[listId];
	if (!list) {
		list = await getList(listId, browser, event.fetch);
	} else {
		console.log('fetched list from cache');
	}
	return {
		listId,
		list,
		childListId: await getListIdByParentListId(listId, browser, event.fetch)
	};
}
