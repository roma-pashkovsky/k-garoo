import type { CheckList } from '../types';

export const getChecklistSearchIndex = (checklist: CheckList | null): string => {
	if (!checklist) {
		return '';
	}
	const indexItems = { [checklist.name.toLowerCase()]: true };
	(checklist.items || []).forEach((it) => {
		if (it.itemDescription?.length) {
			it.itemDescription.split(' ').forEach((seg) => {
				indexItems[seg.slice(0, 5).toLowerCase()] = true;
			});
		}
		indexItems[it.category.name.slice(0, 5).toLowerCase()] = true;
	});
	return Object.keys(indexItems).join(';');
};
