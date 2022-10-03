import { BaseDbPersistence } from '../../utils/base-db-persistence';

export class CleanDataDbPersistence extends BaseDbPersistence {
	public async cleanAllData(): Promise<void> {
		const listsByUsers = {
			path: `listsByUsers/${this.userId}`,
			value: null
		};
		const categoryOptions = {
			path: `categoryOptionsByUsers/${this.userId}`,
			value: null
		};
		await this.firebaseUtils.set([listsByUsers, categoryOptions]);

		const accountInfo = {
			path: `users/${this.userId}`,
			value: null
		};
		await this.firebaseUtils.set([accountInfo]);

		await this.firebaseUtils.removeUser();
	}
}
