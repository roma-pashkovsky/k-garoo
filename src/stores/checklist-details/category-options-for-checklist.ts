import type { CategoryOption, CheckListItem, Language } from '../../types';
import type { Readable } from 'svelte/store';
import { AppSettingsStore } from '../app/app-settings';
import { getChecklist, listDataStore } from './checklist-details-data';
import { derived, writable } from 'svelte/store';
import { categoryOptionsByUser } from './category-options';
import { customCategoryId, reservedCategories } from '../../utils/autodetect-data';

export const forceIncludeCategoryOptions = writable<CategoryOption[]>([]);

export const getCategoryOptionsForChecklist = (id: string): Readable<CategoryOption[]> => {
	const locale = AppSettingsStore.lang;
	const items = derived(getChecklist(id), (checklist) => checklist?.items || []);
	const optionsByUser = categoryOptionsByUser;
	return derived(
		[locale, items, optionsByUser, forceIncludeCategoryOptions],
		([localeValue, itemsValue, optionsByUserValue, forceIncludeValue]) =>
			deriveCategoryOptions(
				localeValue as Language,
				itemsValue,
				optionsByUserValue,
				forceIncludeValue
			)
	);
};

function deriveCategoryOptions(
	locale: Language,
	listItems: CheckListItem[],
	categoryOptions: CategoryOption[],
	forceInclude: CategoryOption[]
): CategoryOption[] {
	const optionsMapByName: { [s: string]: CategoryOption } = {};
	(listItems || [])
		.map((it) => it.category)
		.filter((c) => !!c.name)
		.forEach((c) => (optionsMapByName[c.name.toLowerCase()] = c));
	const reserved = Object.keys(reservedCategories).map((catKey) => {
		return {
			id: catKey,
			color: reservedCategories[catKey].color,
			name: reservedCategories[catKey][locale]
		};
	});
	[...(categoryOptions || []), ...reserved, ...forceInclude]
		.filter((c) => !!c.name)
		.forEach((c) => {
			const n = c.name.toLowerCase();
			if (!optionsMapByName[n]) {
				optionsMapByName[n] = c;
			}
		});
	const res = Object.values(optionsMapByName);
	sortCategoryOptions(res);
	return res;
}

function sortCategoryOptions(options: CategoryOption[]): void {
	options.sort((a, b) => {
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
