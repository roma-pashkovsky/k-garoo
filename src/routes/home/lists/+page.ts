import { ChecklistMainListStore } from '../../../stores/checklist-main-list/checklist-main-list-store';
import { browser } from '$app/environment';

export async function load(event: any) {
	if (browser) {
		const store = new ChecklistMainListStore();
		await store.init();
		return {
			store
		};
	}
}
