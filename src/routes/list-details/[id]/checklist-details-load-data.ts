import type { CheckList, ChecklistSettings, Proposition } from '../../../types';
import type { ChecklistDetailsStore } from '../../../stores/checklist-details/checklist-details-store';

export interface ChecklistDetailsLoadData {
	listId: string;
	list: CheckList | null;
	checklistSettings: ChecklistSettings;
	store: ChecklistDetailsStore;
	locale: 'en' | 'ua';
}
