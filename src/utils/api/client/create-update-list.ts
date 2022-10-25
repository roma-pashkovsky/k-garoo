import type { CheckList, CheckListItem } from '../../../types';

export type CreateListRequest = Partial<CheckList>;

export type UpdateListRequest = Partial<CheckList> & {
	items: {
		added?: CheckListItem[];
		updated: {
			[itemId: string]: Partial<CheckListItem>;
		};
		removed: string[];
	};
};
