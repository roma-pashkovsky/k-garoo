import { BaseDbPersistence } from '../../utils/base-db-persistence';
import type { DbChecklistMainList } from '../../types/db-checklist-main-list';
import type { CheckList } from '../../types';
import type { DbChecklist } from '../../types/db-checklist';

export class ChecklistMainListDbPersistence extends BaseDbPersistence {
	public async getList(): Promise<string[]> {
		if (!this.userId) {
			throw new Error('Cannot perform operation for anonymous');
		}
		return this.firebaseUtils
			.readOnce<DbChecklistMainList>(`listsByUsers/${this.userId}`, 'updated_ts')
			.then((val) => {
				const ids = Object.keys(val || {});
				ids.sort((a, b) => val[b].updated_ts - val[a].updated_ts);
				return ids;
			});
	}

	public isInTheList(listId: string): Promise<boolean> {
		return this.firebaseUtils.exists(`listsByUsers/${this.userId}/${listId}`);
	}

	public async getChecklist(listId: string): Promise<CheckList | null> {
		if (!this.userId) {
			throw new Error('Cannot perform operation for anonymous');
		}
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
