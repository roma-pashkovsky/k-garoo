import type { CategoryOption, CheckList, CheckListItem } from '../../types';
import type { DbChecklist } from '../../types/db-checklist';
import { arrayToMap } from '../../utils/array-to-map';
import { BaseDbPersistence } from '../../utils/base-db-persistence';

export class ChecklistDetailsDbPersistence extends BaseDbPersistence {
	public async getList(listId: string): Promise<CheckList | null> {
		const listDb: DbChecklist = await this.firebaseUtils.readOnce<DbChecklist>(
			`listData/${listId}`
		);
		if (listDb) {
			const items = Object.values(listDb.items);
			items.sort((a, b) => a.orderAdded - b.orderAdded);
			return {
				...listDb,
				items
			};
		}
		return null;
	}

	public isListAddedToUserCollection(listId: string): Promise<boolean> {
		return this.firebaseUtils.exists(`listsByUsers/${this.userId}/${listId}`);
	}

	public isListSharedWithUser(listId: string): Promise<boolean> {
		throw new Error('Not implemented');
	}

	public async addListToUserCollection(listId: string, ts: number): Promise<void> {
		const listsByUsersPath = `listsByUsers/${this.userId}/${listId}`;
		await this.firebaseUtils.set([{ path: listsByUsersPath, value: { updated_ts: ts } }]);
	}

	public isCategoryOptionExist(optionId: string): Promise<boolean> {
		this.checkUserId();
		return this.firebaseUtils.exists(`categoryOptionsByUsers/${this.userId}/${optionId}`);
	}

	public async getCategoryOptions(): Promise<CategoryOption[]> {
		this.checkUserId();
		const categoriesDb: { [id: string]: CategoryOption } = await this.firebaseUtils.readOnce(
			`categoryOptionsByUsers/${this.userId}`
		);
		return Object.values(categoriesDb || {});
	}

	public getListVersion(listId: string): Promise<number | undefined> {
		return this.firebaseUtils
			.readOnce<number | undefined>(`listData/${listId}/updated_utc`)
			.catch((err) => {
				// no list in db
				console.log('no list persisted');
				return 0;
			});
	}

	public async upsertList(
		id: string,
		name: string,
		items: CheckListItem[],
		ts: number
	): Promise<void> {
		this.checkUserId();
		// add to lists by users
		await this.addListToUserCollection(id, ts);
		await this.saveListData(id, name, items, ts);
	}

	public async saveListName(id: string, name: string, ts: number): Promise<void> {
		const namePath = `listData/${id}/name`;
		const updatedTSDataPath = `listData/${id}/updated_utc`;
		await this.firebaseUtils.set([
			{
				path: namePath,
				value: name
			},
			{
				path: updatedTSDataPath,
				value: ts
			}
		]);
	}

	public async upsertListItems(id: string, items: CheckListItem[], ts: number): Promise<void> {
		const updatedItems = items.map((it) => {
			return {
				path: `listData/${id}/items/${it.id}`,
				value: it
			};
		});
		const updatedTSDataPath = `listData/${id}/updated_utc`;
		await this.firebaseUtils.set([...updatedItems, { path: updatedTSDataPath, value: ts }]);
	}

	public async setListItems(id: string, items: CheckListItem[], ts: number): Promise<void> {
		const itemsMap = arrayToMap(items, 'id');
		const itemsUpdate = {
			path: `listData/${id}/items`,
			value: itemsMap
		};

		const tsUpdate = {
			path: `listData/${id}/updated_utc`,
			value: ts
		};
		await this.firebaseUtils.set([itemsUpdate, tsUpdate]);
	}

	public async removeListItems(id: string, itemIds: string[], ts: number): Promise<void> {
		this.checkUserId();
		const removePaths = itemIds.map((itemId) => `listData/${id}/items/${itemId}`);
		const updatedTSDataPath = `listData/${id}/updated_utc`;
		await this.firebaseUtils.set([
			...removePaths.map((p) => ({ path: p, value: null })),
			{ path: updatedTSDataPath, value: ts }
		]);
	}

	public async addCategoryOption(option: CategoryOption): Promise<void> {
		this.checkUserId();
		const optionUpdate = {
			path: `categoryOptionsByUsers/${this.userId}/${option.id}`,
			value: option
		};
		await this.firebaseUtils.set([optionUpdate]);
	}

	public async updateList({ id, items, name, updated_utc, created_utc }: CheckList): Promise<void> {
		const itemsMap = arrayToMap(items, 'id');
		const list: DbChecklist = {
			id,
			name,
			items: itemsMap,
			updated_utc,
			created_utc
		};
		const listDataUpdate = {
			path: `listData/${id}`,
			value: list
		};
		await this.firebaseUtils.set([listDataUpdate]);
	}

	public async saveListData(
		id: string,
		name: string,
		items: CheckListItem[],
		ts: number
	): Promise<void> {
		const itemsMap = arrayToMap(items, 'id');

		const list: DbChecklist = {
			id,
			name,
			items: itemsMap,
			updated_utc: ts,
			created_utc: ts
		};
		await this.firebaseUtils.set([{ path: `listData/${id}`, value: list }]);
	}

	private checkUserId(): void {
		if (!this.userId) {
			throw new Error('Cannot perform this operation without user id');
		}
	}
}
