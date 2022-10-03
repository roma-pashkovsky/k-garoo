import type { CheckList } from '../../types';
import {
	getListData,
	getListIds,
	removeListData,
	setListIds
} from '../../utils/local-storage-state';

export class ChecklistMainListLocalStoragePersistence {
	public getList(): Promise<string[]> {
		return Promise.resolve(getListIds());
	}

	public getChecklist(listId: string): Promise<CheckList | null> {
		return Promise.resolve(getListData(listId));
	}

	public async removeList(listId: string): Promise<void> {
		const ids = await this.getList();
		const updated = ids.filter((id) => id !== listId);
		setListIds(updated);
		removeListData(listId);
	}
}
