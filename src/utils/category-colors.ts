import type { CategoryOption, CheckListItem } from '../types';

export const darkEquivalents = {
	'gray-100': 'gray-900',
	'green-100': 'green-900',
	'yellow-100': 'yellow-900',
	'purple-100': 'purple-900',
	'blue-100': 'blue-900',
	'amber-100': 'amber-900',
	'slate-100': 'slate-900',
	'zinc-100': 'zinc-900',
	'red-100': 'red-900',
	'orange-100': 'orange-900',
	'emerald-100': 'emerald-900',
	'teal-100': 'teal-900',
	'cyan-100': 'cyan-900',
	'indigo-100': 'indigo-900',
	'rose-100': 'rose-900',
	'fuchsia-100': 'fuchsia-900',
	'lime-100': 'lime-900'
};

export const categoryColors = [
	'gray-100',
	'green-100',
	'yellow-100',
	'purple-100',
	'blue-100',
	'amber-100',
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
