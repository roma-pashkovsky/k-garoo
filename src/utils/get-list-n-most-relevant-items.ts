import type { CheckListItem, ChecklistWithSettings } from '../types';
import { getChecklistGroupedByCategory } from './get-checklist-grouped-by-category';

export const getListNMostRelevantItems = (
	list: ChecklistWithSettings,
	n: number
): CheckListItem[] => {
	let items = [];
	if (list.isGroupByCategory) {
		const grouped = getChecklistGroupedByCategory(list.items);
		for (const cat of grouped) {
			if (cat.items) {
				for (const item of cat.items) {
					items.push(item);
				}
			}
		}
	} else {
		items = list.items;
	}
	if (!items?.length) {
		return [];
	}
	const unchecked = items.filter((it) => !it.checked);
	if (unchecked.length >= n) {
		return unchecked.slice(0, n);
	} else {
		const rest = n - unchecked.length;
		const checked = items.filter((it) => it.checked);
		return [...unchecked, ...checked.slice(0, rest)];
	}
};
