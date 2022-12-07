import type { CategoryOption, CheckListItem, Proposition } from '../../types';
import { customCategoryId, reservedCategories } from '../../utils/autodetect-data';

export class CategoryOptionManager {
	constructor(
		private categoryOptions: CategoryOption[],
		private listItems: CheckListItem[],
		private propositions: Proposition[],
		private locale: 'en' | 'ua'
	) {}

	public getCategoryOptions(): CategoryOption[] {
		const optionsMapByName: { [s: string]: CategoryOption } = {};
		(this.listItems || [])
			.map((it) => it.category)
			.filter((c) => !!c.name)
			.forEach((c) => (optionsMapByName[c.name.toLowerCase()] = c));
		const reserved = Object.keys(reservedCategories).map((catKey) => {
			return {
				id: catKey,
				color: reservedCategories[catKey].color,
				name: reservedCategories[catKey][this.locale]
			};
		});
		const fromProps = this.propositions.map((prop) => prop?.category).filter((cat) => !!cat);
		[...(this.categoryOptions || []), ...reserved, ...fromProps]
			.filter((c) => !!c.name)
			.forEach((c) => {
				const n = c.name.toLowerCase();
				if (!optionsMapByName[n]) {
					optionsMapByName[n] = c;
				}
			});
		const res = Object.values(optionsMapByName);
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
