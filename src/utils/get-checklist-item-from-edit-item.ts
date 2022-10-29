import type { CheckListItem, CheckListItemEditModel } from '../types';

export const getChecklistItemFromEditItem = (source: CheckListItemEditModel): CheckListItem => {
	return {
		id: source.id,
		itemDescription: source.itemDescription,
		category: source.category,
		checked: source.checked,
		orderAdded: source.orderAdded
	};
};
