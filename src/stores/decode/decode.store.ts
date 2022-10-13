import type { CheckList } from '../../types';
import { CheckListDetailsLocalStoragePersistence } from '../checklist-details/check-list-details-local-storage-persistence';

export class DecodeStore {
	private persistence = new CheckListDetailsLocalStoragePersistence();
	public async process(checklist: CheckList): Promise<void> {
		const savedVersion = await this.persistence.getListVersion(checklist.id);

		if (savedVersion === undefined) {
			// new list has to be created
			await this.persistence.createList(
				checklist.id,
				checklist.name,
				checklist.items,
				checklist.updated_utc
			);
		} else if (savedVersion < checklist.updated_utc || 0) {
			// list should be updated
			await this.persistence.updateList(checklist, checklist.updated_utc);
		}
	}
}
