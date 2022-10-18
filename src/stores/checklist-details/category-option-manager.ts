import type { CategoryOption, CheckListItem } from '../../types';
import { customCategoryId, reservedCategories } from '../../utils/autodetect-data';

export class CategoryOptionManager {
	constructor(
		private categoryOptions: CategoryOption[],
		private listItems: CheckListItem[],
		private locale: 'en' | 'ua'
	) {}

	public getCategoryOptions(): CategoryOption[] {
		const optionsMap: { [s: string]: CategoryOption } = {};
		(this.listItems || [])
			.map((it) => it.category)
			.forEach((c) => (optionsMap[c.name.toLowerCase()] = c));
		const reserved = Object.keys(reservedCategories).map((catKey) => {
			return {
				id: catKey,
				color: reservedCategories[catKey].color,
				name: reservedCategories[catKey][this.locale]
			};
		});
		[...(this.categoryOptions || []), ...reserved].forEach((c) => {
			const n = c.name.toLowerCase();
			if (!optionsMap[n]) {
				optionsMap[n] = c;
			}
		});
		const res = Object.values(optionsMap);
		this.sortCategories(res);
		return res;
	}

	public sortCategories(reserved: CategoryOption[]): void {
		reserved.sort((a, b) => {
			if (a.id === customCategoryId) {
				return 1;
			}
			if (b.id === customCategoryId) {
				return -1;
			}
			if (a.name < b.name) {
				return -1;
			} else {
				return 1;
			}
		});
	}
}
