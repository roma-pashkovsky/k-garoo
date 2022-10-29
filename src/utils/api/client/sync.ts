import type { CategoryOption, CheckList, ChecklistSettings } from '../../../types';

export type SyncRequest = {
	lists?: CheckList[];
	categoryOptions?: CategoryOption[];
	checklistSettings?: { [listId: string]: ChecklistSettings | null };
};
