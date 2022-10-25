import type { ChecklistDetailsLoadData } from './checklist-details-load-data';
import type { LoadEvent } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { getList } from '../../../stores/checklist-details/checklist-details-data';
import { getState } from '../../../utils/local-storage-state';
import { loadUserFromSession } from '../../../stores/login/auth';

export async function load(event: LoadEvent): Promise<ChecklistDetailsLoadData | undefined> {
	const listId: string = event.params.id as string;
	await loadUserFromSession(event.fetch);
	const list = await getList(listId, browser, event.fetch);
	if (browser) {
		return {
			listId,
			list,
			checklistSettings: getState().checklistSettings
		};
	} else {
		return {
			listId,
			list
		};
	}
}
