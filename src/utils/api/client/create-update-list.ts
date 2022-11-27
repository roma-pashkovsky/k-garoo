import type { CheckList, CheckListItem } from '../../../types';

export type CreateListRequest = Partial<CheckList> & { parentListId?: string };

export type UpdateListRequest = Partial<Omit<CheckList, 'items'>> & {
	items?: {
		added?: CheckListItem[];
		updated?: {
			[itemId: string]: Partial<CheckListItem>;
		};
		removed?: string[];
	};
};
