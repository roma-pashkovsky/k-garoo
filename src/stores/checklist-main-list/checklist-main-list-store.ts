import { get, writable } from 'svelte/store';
import { ChecklistMainListDbPersistence } from './checklist-main-list-db-persistence';
import { ChecklistMainListLocalStoragePersistence } from './checklist-main-list-local-storage-persistence';
import { setListIds } from '../../utils/local-storage-state';
import { AuthStore } from '../login/auth.store';

export class ChecklistMainListStore {
	public static items = writable<string[]>([]);

	private localPersistence = new ChecklistMainListLocalStoragePersistence();
	private dbPersistence = new ChecklistMainListDbPersistence();

	public async init(): Promise<void> {
		const local = await this.localPersistence.getList();
		ChecklistMainListStore.items.set(local);
		this.dbPersistence.onDbAvailableChange(async () => {
			// this callback should fire after other auth callbacks,
			// so that we wait until the data is synced
			setTimeout(async () => {
				if (!get(AuthStore.isSyncingData)) {
					await this.setItems();
				} else {
					const unsub = AuthStore.isSyncingData.subscribe((isSyncing) => {
						if (!isSyncing) {
							this.setItems();
							unsub();
						}
					});
				}
			}, 200);
		});
	}

	public destroy() {
		this.dbPersistence.destroy();
	}

	public async removeList(listId: string): Promise<void> {
		ChecklistMainListStore.items.update((items) => {
			return items.filter((id) => id !== listId);
		});
		await this.localPersistence.removeList(listId);
		if (this.dbPersistence.isLoggedIn) {
			await this.dbPersistence.removeList(listId);
		}
	}

	private async setItems(): Promise<void> {
		if (this.dbPersistence.isLoggedIn) {
			const items = await this.dbPersistence.getList();
			console.log('remote items: ', items);
			ChecklistMainListStore.items.set(items);
			this.updateLocalStoreWithRemoteItems(items);
		} else {
			const items = await this.localPersistence.getList();
			console.log('local items: ', items);
			ChecklistMainListStore.items.set(items);
		}
	}

	private updateLocalStoreWithRemoteItems(listIds: string[]): void {
		setListIds(listIds);
	}
}
