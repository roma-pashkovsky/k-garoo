import type { CheckListItem } from '../types';

export const getChecklistNextItemOrderAdded = (items: CheckListItem[]): number => {
	if (!items?.length) {
		return 0;
	}
	const last = items[items.length - 1];
	if (last.orderAdded) {
		return last.orderAdded + 1;
	}
	return items.length + 1;
};
