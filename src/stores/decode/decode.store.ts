import type { CheckList } from '../../types';
import { CheckListDetailsLocalStoragePersistence } from '../checklist-details/check-list-details-local-storage-persistence';

export class DecodeStore {
	private persistence = new CheckListDetailsLocalStoragePersistence();
	public async process(checklist: CheckList): Promise<void> {
		await this.persistence.updateList(checklist);
	}
}
