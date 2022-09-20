import type { CategoryOption, CheckListItem } from '../types';

export const categoryColors = [
	'slate-100',
	'zinc-100',
	'red-100',
	'orange-100',
	'emerald-100',
	'teal-100',
	'cyan-100',
	'indigo-100',
	'rose-100',
	'fuchsia-100',
	'lime-100'
];

export const pickColorForACategory = (
	items: CheckListItem[],
	categoryOptions: CategoryOption[]
): string => {
	const busyColors: any = {};
	items.forEach((it) => (busyColors[it.category.color || ''] = true));
	const resultForItems = categoryColors.find((c) => !busyColors[c]);
	categoryOptions.forEach((co) => (busyColors[co.color || ''] = true));
	const resultForCategories = categoryColors.find((c) => !busyColors[c]);
	return (
		resultForCategories ||
		resultForItems ||
		categoryColors[Math.floor(Math.random() * categoryColors.length)]
	);
};
