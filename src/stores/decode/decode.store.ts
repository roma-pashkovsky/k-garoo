import type { CheckList } from '../../types';
import { setListData } from '../../utils/local-storage-state';

export class DecodeStore {
	public async process(checklist: CheckList): Promise<void> {
		setListData(checklist);
	}
}
