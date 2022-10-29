import type { CheckList, CheckListItem } from '../types';

export const getListNMostRelevantItems = (list: CheckList, n: number): CheckListItem[] => {
	if (!list?.items?.length) {
		return [];
	}
	const unchecked = list.items.filter((it) => !it.checked);
	if (unchecked.length >= n) {
		return unchecked.slice(0, n);
	} else {
		const rest = n - unchecked.length;
		const checked = list.items.filter((it) => it.checked);
		return [...unchecked, ...checked.slice(0, rest)];
	}
};
