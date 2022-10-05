import type { ChecklistDetailsLoadData } from './checklist-details-load-data';
import type { LoadEvent } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { locale } from '../../../utils/i18n';
import { browser } from '$app/environment';
import { ChecklistDetailsStore } from '../../../stores/checklist-details/checklist-details-store';

export async function load(event: LoadEvent): Promise<ChecklistDetailsLoadData | undefined> {
	const listId: string = event.params.id as string;
	if (browser) {
		const l: 'en' | 'ua' = get(locale) as 'en' | 'ua';
		const store = new ChecklistDetailsStore(l);
		const list = await store.getList(listId);
		const checklistSettings = await store.getChecklistSettings();
		const propositions = await store.getPropositions();
		return {
			listId,
			store,
			locale: l,
			list,
			checklistSettings,
			propositions
		};
	}
}
