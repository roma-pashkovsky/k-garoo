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
import type { LayoutLoad } from '../../../../../.svelte-kit/types/src/routes/$types';

export const load: LayoutLoad = async ({
	fetch,
	parent,
	params
}): Promise<ChecklistDetailsLoadData | undefined> => {
	await parent();
	const listId: string = params.id as string;
	return {
		listId,
		list: await loadList(listId, browser, fetch),
		childListId: await getListIdByParentListId(listId, browser, fetch)
	};
};
