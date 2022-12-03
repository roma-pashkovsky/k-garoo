import type { CheckListItem, CheckListItemEditModel } from '../types';
import { getChecklistGroupedByCategory } from './get-checklist-grouped-by-category';

export const getCategoryOrderInTheList = (
	categoryId: string,
	items: CheckListItem[] = []
): number => {
	if (!items.length) {
		return 0;
	}
	const grouped = getChecklistGroupedByCategory(items);
	for (let i = 0; i < grouped.length; i++) {
		if (grouped[i].category.id === categoryId) {
			return grouped[i].category.order ?? i;
		}
	}
	return (grouped[grouped.length - 1].category.order ?? 0) + 1;
};

/**
 * Returns only affected items
 */
export const moveCategoryUp = (
	categoryId: string,
	items: CheckListItemEditModel[]
): CheckListItemEditModel[] => {
	const grouped = getChecklistGroupedByCategory(items);
	const prevInd = grouped.findIndex((cat) => cat.category.id === categoryId);
	if (prevInd === 0) {
		return [];
	}
	const newInd = prevInd - 1;
	const affected: CheckListItemEditModel[] = [];
	let targetMoveToInd = grouped[newInd].category.order ?? newInd;
	const targetMoveFromInd = grouped[prevInd].category.order ?? prevInd;
	if (targetMoveFromInd === targetMoveToInd) {
		targetMoveToInd = targetMoveFromInd - 1;
	}
	for (const it of grouped[prevInd].items) {
		const order = targetMoveToInd;
		affected.push({
			...it,
			category: { ...it.category, order }
		});
	}
	for (const it of grouped[newInd].items) {
		const order = targetMoveFromInd;
		affected.push({
			...it,
			category: { ...it.category, order }
		});
	}
	return affected;
};

/**
 * Returns only affected items
 */
export const moveCategoryDown = (
	categoryId: string,
	items: CheckListItemEditModel[]
): CheckListItemEditModel[] => {
	const grouped = getChecklistGroupedByCategory(items);
	const prevInd = grouped.findIndex((cat) => cat.category.id === categoryId);
	if (prevInd === grouped.length - 1) {
		return [];
	}
	const newInd = prevInd + 1;
	const affected: CheckListItemEditModel[] = [];
	let targetMoveToInd = grouped[newInd].category.order ?? newInd;
	const targetMoveFromInd = grouped[prevInd].category.order ?? prevInd;
	if (targetMoveToInd === targetMoveFromInd) {
		targetMoveToInd = targetMoveFromInd + 1;
	}
	for (const it of grouped[prevInd].items) {
		const order = targetMoveToInd;
		affected.push({ ...it, category: { ...it.category, order } });
	}
	for (const it of grouped[newInd].items) {
		const order = targetMoveFromInd;
		affected.push({ ...it, category: { ...it.category, order } });
	}
	return affected;
};
