export const customCategoryId = 'custom';
export const otherCategoryId = 'other';

export const reservedCategories: {
	[categoryId: string]: { id: string; ua: string; en: string; color: string | undefined };
} = {
	[otherCategoryId]: {
		id: otherCategoryId,
		ua: 'Інше',
		en: 'Other',
		color: 'gray-100'
	},
	[customCategoryId]: {
		id: customCategoryId,
		ua: 'Нова категорія...',
		en: 'Add category...',
		color: undefined
	},
	['fruit']: {
		id: 'fruit',
		ua: 'Фрукти',
		en: 'Fruits',
		color: 'yellow-100'
	},
	['veggies']: {
		id: 'veggies',
		ua: 'Овочі',
		en: 'Veggies',
		color: 'green-100'
	},
	['household chemicals']: {
		id: 'household chemicals',
		ua: 'Побутова хімія',
		en: 'Household chemicals',
		color: 'purple-100'
	},
	['milk']: {
		id: 'milk',
		ua: 'Молочка',
		en: 'Milk',
		color: 'blue-100'
	},
	['cereals']: {
		id: 'cereals',
		ua: 'Крупи',
		en: 'Cereals',
		color: 'amber-100'
	}
};

export const wordMap: {
	[word: string]: {
		ua: string;
		en: string;
		categoryId: string;
	};
} = {
	// Veggies
	['potatoes']: {
		ua: 'картопля',
		en: 'potatoes',
		categoryId: 'veggies'
	},
	['cabbage']: {
		ua: 'капуста',
		en: 'cabbage',
		categoryId: 'veggies'
	},
	['broccoli']: {
		ua: 'броколі',
		en: 'broccoli',
		categoryId: 'veggies'
	},
	['onions']: {
		ua: 'цибуля',
		en: 'onions',
		categoryId: 'veggies'
	},
	['carrots']: {
		ua: 'морква',
		en: 'carrots',
		categoryId: 'veggies'
	},
	['tomatoes']: {
		ua: 'томат',
		en: 'tomatoes',
		categoryId: 'veggies'
	},
	['eggplant']: {
		ua: 'баклажан',
		en: 'eggplant',
		categoryId: 'veggies'
	},
	['bell pepper']: {
		ua: 'перець солодкий',
		en: 'bell pepper',
		categoryId: 'veggies'
	},
	['zucchini']: {
		ua: 'кабачок',
		en: 'zucchini',
		categoryId: 'veggies'
	},
	['cherry_tomatoes']: {
		ua: 'томат черрі',
		en: 'cherry tomatoes',
		categoryId: 'veggies'
	},
	['ginger']: {
		ua: 'імбир',
		en: 'ginger',
		categoryId: 'veggies'
	},
	['radish']: {
		ua: 'редиска',
		en: 'radish',
		categoryId: 'veggies'
	},
	['beet']: {
		ua: 'буряк',
		en: 'beet',
		categoryId: 'veggies'
	},
	['cucumber']: {
		ua: 'огірки',
		en: 'cucumbers',
		categoryId: 'veggies'
	},
	['pumpkin']: {
		ua: 'гарбуз',
		en: 'pumpkin',
		categoryId: 'veggies'
	},
	['celery']: {
		ua: 'селера',
		en: 'celery',
		categoryId: 'veggies'
	},
	// Fruit
	['banana']: {
		ua: 'банани',
		en: 'banana',
		categoryId: 'fruit'
	},
	['nectarines']: {
		ua: 'нектарини',
		en: 'nectarines',
		categoryId: 'fruit'
	},
	['peaches']: {
		ua: 'персики',
		en: 'peaches',
		categoryId: 'fruit'
	},
	['avocado']: {
		ua: 'авокадо',
		en: 'avocado',
		categoryId: 'fruit'
	},
	['prunes']: {
		ua: 'сливи',
		en: 'prunes',
		categoryId: 'fruit'
	},
	['lime']: {
		ua: 'лайм',
		en: 'lime',
		categoryId: 'fruit'
	},

	// Household chemicals
	['soap']: {
		ua: 'мило',
		en: 'soap',
		categoryId: 'household chemicals'
	},
	['washing liquid']: {
		ua: 'рідина для миття посуду',
		en: 'washing liquid',
		categoryId: 'household chemicals'
	},
	['laundry powder']: {
		ua: 'пральний порошок',
		en: 'laundry powder',
		categoryId: 'household chemicals'
	}
};
