import type { CategoryOption } from '../../types';
import { customCategoryId, otherCategoryId, reservedCategories } from '../../utils/autodetect-data';

export class CategoryOptionManager {
	constructor(private categoryOptions: CategoryOption[], private locale: 'en' | 'ua') {}

	public getCategoryOptions(): CategoryOption[] {
		const reserved = Object.keys(reservedCategories).map((catKey) => {
			return {
				id: catKey,
				color: reservedCategories[catKey].color,
				name: reservedCategories[catKey][this.locale]
			};
		});
		const res = [...(this.categoryOptions || []), ...reserved];
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
