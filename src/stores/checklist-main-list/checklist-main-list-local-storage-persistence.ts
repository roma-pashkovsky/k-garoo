import type { CheckList, PersistedList } from '../../types';
import {
	getListData,
	getListIds,
	removeListData,
	setListIds
} from '../../utils/local-storage-state';

export class ChecklistMainListLocalStoragePersistence {
	public getList(): Promise<PersistedList> {
		return new Promise<PersistedList>((resolve) => {
			requestAnimationFrame(() => {
				const list = getListIds();
				resolve(list);
			});
		});
	}

	public getChecklist(listId: string): Promise<CheckList | null> {
		return Promise.resolve(getListData(listId));
	}

	public async removeList(listId: string): Promise<void> {
		const ids = getListIds();
		delete ids[listId];
		setListIds(ids);
		removeListData(listId);
	}
}
