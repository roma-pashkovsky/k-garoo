import { FirebaseUtils } from '../../utils/firebase-utils';
import { ChecklistMainListLocalStoragePersistence } from '../checklist-main-list/checklist-main-list-local-storage-persistence';
import { ChecklistMainListDbPersistence } from '../checklist-main-list/checklist-main-list-db-persistence';
import { CheckListDetailsLocalStoragePersistence } from '../checklist-details/check-list-details-local-storage-persistence';
import { ChecklistDetailsDbPersistence } from '../checklist-details/checklist-details-db-persistence';

export class SyncStore {
	private firebaseUtils = new FirebaseUtils();
	private localListPersistence = new ChecklistMainListLocalStoragePersistence();
	private dbListPersistence = new ChecklistMainListDbPersistence();
	private localDetailsPersistence = new CheckListDetailsLocalStoragePersistence();
	private dbDetailsPersistence = new ChecklistDetailsDbPersistence();

	public async syncLocalDataToDb(): Promise<void> {
		// sync local lists
		const localList = await this.localListPersistence.getList();
		const localListIds = localList ? Object.keys(localList) : [];
		for (const localId of localListIds) {
			const localVersion = await this.localDetailsPersistence.getListVersion(localId);
			const dbVersion = await this.dbDetailsPersistence.getListVersion(localId);
			if ((localVersion || 0) > (dbVersion || 0)) {
				const list = await this.localDetailsPersistence.getList(localId);
				if (list) {
					if (!dbVersion) {
						const { id, name, items, updated_utc } = list;
						await this.dbDetailsPersistence.upsertList(id, name, items, updated_utc);
					}
				}
			}
		}
		// sync local categories
		const localCategories = await this.localDetailsPersistence.getCategoryOptions();
		if (localCategories?.length) {
			for (const localCat of localCategories) {
				const exists = await this.dbDetailsPersistence.isCategoryOptionExist(localCat.id);
				if (!exists) {
					await this.dbDetailsPersistence.addCategoryOption(localCat);
				}
			}
		}
	}
}
