import type { CheckListItem, ChecklistWithSettings } from '../types';
import { getChecklistGroupedByCategory } from './get-checklist-grouped-by-category';

export const getListNMostRelevantItems = (
	list: ChecklistWithSettings,
	n: number
): CheckListItem[] => {
	if (!list?.items) {
		return [];
	}
	const result = [];
	const source = list.hideCrossedOut ? list.items.filter((it) => !it.checked) : list.items;

	if (list.isGroupByCategory) {
		const grouped = getChecklistGroupedByCategory(source);
		for (const cat of grouped) {
			if (cat.items) {
				for (const item of cat.items) {
					if (result.length < n) {
						result.push(item);
					} else {
						break;
					}
				}
			}
		}
	} else {
		for (const item of source) {
			if (result.length < n) {
				result.push(item);
			} else {
				break;
			}
		}
	}
	return result;
};
