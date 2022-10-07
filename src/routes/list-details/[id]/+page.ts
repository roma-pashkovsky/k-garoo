import type { ChecklistDetailsLoadData } from './checklist-details-load-data';
import type { LoadEvent } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { ChecklistDetailsStore } from '../../../stores/checklist-details/checklist-details-store';
import { AppSettingsStore } from '../../../stores/app/app-settings';

export async function load(event: LoadEvent): Promise<ChecklistDetailsLoadData | undefined> {
	const listId: string = event.params.id as string;
	if (browser) {
		ChecklistDetailsStore.init();
		const l: 'en' | 'ua' = get(AppSettingsStore.lang) as 'en' | 'ua';
		const store = new ChecklistDetailsStore(l);
		const list = await store.getList(listId);
		const checklistSettings = await store.getChecklistSettings();
		return {
			listId,
			store,
			locale: l,
			list,
			checklistSettings
		};
	}
}
