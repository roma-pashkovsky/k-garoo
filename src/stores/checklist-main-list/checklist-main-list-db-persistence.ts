import { BaseDbPersistence } from '../../utils/base-db-persistence';
import type { DbChecklistMainList } from '../../types/db-checklist-main-list';
import type { CheckList, PersistedList } from '../../types';
import type { DbChecklist } from '../../types/db-checklist';

export class ChecklistMainListDbPersistence extends BaseDbPersistence {
	public async getList(): Promise<PersistedList> {
		if (!this.userId) {
			throw new Error('Cannot perform operation for anonymous');
		}
		return this.firebaseUtils.readOnce<DbChecklistMainList>(
			`listsByUsers/${this.userId}`,
			'updated_ts'
		);
	}

	public async getChecklist(listId: string): Promise<CheckList | null> {
		const db = await this.firebaseUtils.readOnce<DbChecklist | null>(`listData/${listId}`);
		if (db) {
			const items = Object.values(db.items);
			items.sort((a, b) => a.orderAdded - b.orderAdded);
			return { ...db, items };
		} else {
			return null;
		}
	}

	public removeList(listId: string): Promise<void> {
		if (!this.userId) {
			throw new Error('Cannot perform operation for anonymous');
		}
		const listByUserPath = `listsByUsers/${this.userId}/${listId}`;
		return this.firebaseUtils.set([{ path: listByUserPath, value: null }]);
	}
}
