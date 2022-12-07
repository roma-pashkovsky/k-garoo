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
	const lastCategoryOrder = Math.max(
		grouped.length - 1,
		grouped[grouped.length - 1].category.order ?? 0
	);
	return lastCategoryOrder + 1;
};

/**
 * Returns only affected items
 */
export const moveCategoryUp = (
	categoryId: string,
	items: CheckListItemEditModel[],
	hideCrossedOut: boolean
): CheckListItemEditModel[] => {
	const displayItems = hideCrossedOut ? items.filter((it) => !it.checked) : items;
	const displayGrouped = getChecklistGroupedByCategory(displayItems);
	const prevInd = displayGrouped.findIndex((cat) => cat.category.id === categoryId);
	if (prevInd === 0) {
		return [];
	}
	const newInd = prevInd - 1;
	let targetMoveToInd = displayGrouped[newInd].category.order ?? newInd;
	const targetMoveFromInd = displayGrouped[prevInd].category.order ?? prevInd;
	if (targetMoveFromInd === targetMoveToInd) {
		targetMoveToInd = targetMoveFromInd - 1;
	}
	const replacedCategoryId = displayGrouped[newInd].category.id;
	const affected: CheckListItemEditModel[] = [];
	for (const it of items) {
		if (it.category.id === categoryId) {
			const order = targetMoveToInd;
			affected.push({
				...it,
				category: { ...it.category, order }
			});
		} else if (it.category.id === replacedCategoryId) {
			const order = targetMoveFromInd;
			affected.push({
				...it,
				category: { ...it.category, order }
			});
		}
	}
	return affected;
};

/**
 * Returns only affected items
 */
export const moveCategoryDown = (
	categoryId: string,
	items: CheckListItemEditModel[],
	hideCrossedOut: boolean
): CheckListItemEditModel[] => {
	const displayItems = hideCrossedOut ? items.filter((it) => !it.checked) : items;
	const displayGrouped = getChecklistGroupedByCategory(displayItems);
	const prevInd = displayGrouped.findIndex((cat) => cat.category.id === categoryId);
	if (prevInd === displayGrouped.length - 1) {
		return [];
	}
	const newInd = prevInd + 1;
	let targetMoveToInd = displayGrouped[newInd].category.order ?? newInd;
	const targetMoveFromInd = displayGrouped[prevInd].category.order ?? prevInd;
	if (targetMoveToInd === targetMoveFromInd) {
		targetMoveToInd = targetMoveFromInd + 1;
	}
	const affected: CheckListItemEditModel[] = [];
	const replacedCategoryId = displayGrouped[newInd].category.id;
	for (const it of items) {
		if (it.category.id === categoryId) {
			const order = targetMoveToInd;
			affected.push({
				...it,
				category: { ...it.category, order }
			});
		} else if (it.category.id === replacedCategoryId) {
			const order = targetMoveFromInd;
			affected.push({
				...it,
				category: { ...it.category, order }
			});
		}
	}
	return affected;
};
