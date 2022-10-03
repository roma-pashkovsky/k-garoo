import { writable } from 'svelte/store';
import type { CheckList } from '../../types';
import { ChecklistMainListLocalStoragePersistence } from './checklist-main-list-local-storage-persistence';
import { ChecklistMainListDbPersistence } from './checklist-main-list-db-persistence';
import { setListData } from '../../utils/local-storage-state';

export class ChecklistMainListItemStore {
	public checklist = writable<CheckList | null>(null);

	private localPersistence = new ChecklistMainListLocalStoragePersistence();
	private dbPersistence = new ChecklistMainListDbPersistence();

	public init(listId: string): void {
		this.setCheckList(listId);
		this.dbPersistence.onDbAvailableChange(async () => {
			this.setCheckList(listId);
		});
	}

	private async setCheckList(listId: string): Promise<void> {
		let checklist: CheckList | null;
		if (this.dbPersistence.isDbAvailable) {
			checklist = await this.dbPersistence.getChecklist(listId);
			if (!checklist) {
				checklist = await this.localPersistence.getChecklist(listId);
			} else {
				// update local store with data
				setTimeout(() => {
					setListData(checklist as CheckList);
				}, 5000);
			}
		} else {
			checklist = await this.localPersistence.getChecklist(listId);
		}
		this.checklist.set(checklist);
	}
}
