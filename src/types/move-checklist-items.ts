import type { CheckListItem } from './index';

export interface MoveChecklistItemsEvent {
	listId: string;
	items: CheckListItem[];
}
