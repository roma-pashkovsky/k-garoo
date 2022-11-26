import type { ChecklistWithSettings } from '../../../../../types';

export interface ChecklistDetailsLoadData {
	listId: string;
	list?: ChecklistWithSettings | null;
}
