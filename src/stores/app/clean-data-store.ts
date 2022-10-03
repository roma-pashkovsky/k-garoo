import { CleanDataDbPersistence } from './clean-data-db-persistence';
import { cleanAllLocalData } from '../../utils/local-storage-state';

export class CleanDataStore {
	private dbPersistence = new CleanDataDbPersistence();

	public async cleanAllData(): Promise<void> {
		if (this.dbPersistence.isDbAvailable) {
			await this.dbPersistence.cleanAllData();
		}
		cleanAllLocalData();
	}
}
