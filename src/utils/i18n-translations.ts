export type Translations = {
	[locale: string]: {
		[key: string]: string;
	};
};

export default {
	en: {
		'app.logo': 'Easy checklists',
		'app.my_lists': 'My lists',
		'app.lang-placeholder': 'Language',
		'lists.no_lists': 'No lists.',
		'lists.no_lists_cta_1': "Let's",
		'lists.no_lists_cta_link': 'add one.',
		'lists.remove-warning': '{{list}} will be removed. Are you sure?',
		'lists.create_new_list.header': 'New list',
		'lists.create_new_list.other-category': 'Other',
		'lists.create_new_list.create-category': 'Add category',
		'lists.create_new_list.possible_duplicates': 'The list might contain duplicates',
		'lists.create_new_list.click-to-add': 'Click to add',
		'lists.create_new_list.set-category-to': 'Set category to',
		'lists.create_new_list.my-category': 'My category',
		// list details
		'lists.details.link-created': 'Link copied to clipboard',
		'lists.details.remove-warning': 'Will remove list. Are you sure?'
	},
	ua: {
		'app.logo': 'Списки',
		'app.my_lists': 'Мої списки',
		'app.lang-placeholder': 'Мова',
		'lists.no_lists': 'Поки що немає списків.',
		'lists.no_lists_cta_1': 'Нумо',
		'lists.no_lists_cta_link': 'створимо список.',
		'lists.remove-warning': 'Видаляємо {{list}}. Впевнені?',
		'lists.create_new_list.header': 'Новий список',
		'lists.create_new_list.other-category': 'Інше',
		'lists.create_new_list.create-category': 'Створити...',
		'lists.create_new_list.possible_duplicates': 'Пункти можуть дублюватись',
		'lists.create_new_list.click-to-add': 'Натисніть, щоб додати',
		'lists.create_new_list.set-category-to': 'Змінити категорію:',
		'lists.create_new_list.my-category': 'Моя категорія',
		// list details
		'lists.details.link-created': 'Посилання скопійовано',
		'lists.details.remove-warning': 'Видаляємо список. Впевнені?'
	}
} as Translations;
