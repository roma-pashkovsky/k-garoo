import type { CheckList, ChecklistSettings } from '../../../types';

export interface ChecklistDetailsLoadData {
	listId: string;
	checklistSettings?: ChecklistSettings;
	list: CheckList | null;
}
