import type { CategoryOption } from '../../types';
import { customCategoryId, otherCategoryId, reservedCategories } from '../../utils/autodetect-data';

export class CategoryOptionManager {
	constructor(private categoryOptions: CategoryOption[], private locale: 'en' | 'ua') {}

	public getCategoryOptions(): CategoryOption[] {
		const reserved = Object.keys(reservedCategories).map((catKey) => {
			return {
				id: catKey,
				name: reservedCategories[catKey][this.locale]
			};
		});
		this.sortReservedCategories(reserved);
		return [...(this.categoryOptions || []), ...reserved];
	}

	public sortReservedCategories(reserved: CategoryOption[]): void {
		reserved.sort((a, b) => {
			if (a.id === otherCategoryId || a.id === customCategoryId) {
				return 1;
			}
			if (b.id === otherCategoryId || b.id === customCategoryId) {
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
