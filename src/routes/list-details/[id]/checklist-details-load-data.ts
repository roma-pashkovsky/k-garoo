import type { ChecklistSettings } from '../../../types';
import type { ChecklistDetailsStore } from '../../../stores/checklist-details/checklist-details-store';

export interface ChecklistDetailsLoadData {
	listId: string;
	checklistSettings: ChecklistSettings;
	store: ChecklistDetailsStore;
}
