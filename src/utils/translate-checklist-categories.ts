import type { CheckListItem, Language } from '../types';
import { reservedCategories } from './autodetect-data';

export const translateChecklistCategories = (
	lang: Language | undefined,
	items: CheckListItem[]
): CheckListItem[] => {
	if (!lang) {
		return items;
	}
	return items.map((source) => {
		if (reservedCategories[source.category.id]) {
			return {
				...source,
				category: {
					...source.category,
					name: reservedCategories[source.category.id][lang]
				}
			};
		} else {
			return source;
		}
	});
};
