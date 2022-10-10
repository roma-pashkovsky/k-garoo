import type { CheckListItem, GroupedByCategoryItem } from '../types';
import { otherCategoryId } from './local-storage-state';

export const getChecklistGroupedByCategory = (items: CheckListItem[]): GroupedByCategoryItem[] => {
	const byCategoryObj: any = {};
	items.forEach((item) => {
		if (!item.category) {
			console.warn('Item without category: ', item);
			return;
		}
		if (!byCategoryObj[item.category.id]) {
			byCategoryObj[item.category.id] = { category: item.category, items: [] };
		}
		if (!byCategoryObj[item.category.id].category.color) {
			byCategoryObj[item.category.id].category.color = item.category.color;
		}
		byCategoryObj[item.category.id].items.push(item);
	});
	const distinctCategories = Object.keys(byCategoryObj);
	distinctCategories.sort((a, b) => {
		if (a === otherCategoryId) {
			return 1;
		}
		if (b === otherCategoryId) {
			return -1;
		}
		if (byCategoryObj[a].category.name < byCategoryObj[b].category.name) {
			return -1;
		} else {
			return 1;
		}
	});
	return distinctCategories.map((categoryId) => {
		return byCategoryObj[categoryId];
	});
};
