export type Translations = {
	[locale: string]: {
		[key: string]: string;
	};
};

export default {
	en: {
		'app.logo': 'Easy checklists',
		'app.my_lists': 'My lists',
		'app.sections.lists': 'Lists',
		'app.sections.login': 'Login',
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
		'lists.create_new_list.propositions-instructions':
			"You'll see items from your previous lists here",
		'lists.create_new_list.no-recent-suggestions': 'No recent suggestions',
		'lists.create_new_list.set-category-to': 'Set category to',
		'lists.create_new_list.my-category': 'My category',
		'lists.create_new_list.remove-selected-warning':
			'Selected items will be removed. Are you sure?',
		// list details
		'lists.details.link-created': 'Link copied to clipboard',
		'lists.details.edit-instruction': 'Press and hold to edit the list',
		'lists.details.remove-warning': 'Will remove list. Are you sure?'
	},
	ua: {
		'app.logo': 'Списки',
		'app.my_lists': 'Мої списки',
		'app.sections.lists': 'Списки',
		'app.sections.login': 'Увійти',
		'app.lang-placeholder': 'Мова',
		'lists.no_lists': 'Поки що тут немає списків.',
		'lists.no_lists_cta_1': 'Нумо',
		'lists.no_lists_cta_link': 'створимо список.',
		'lists.remove-warning': 'Видаляємо {{list}}. Впевнені?',
		'lists.create_new_list.header': 'Новий список',
		'lists.create_new_list.other-category': 'Інше',
		'lists.create_new_list.create-category': 'Створити...',
		'lists.create_new_list.possible_duplicates': 'Пункти можуть дублюватись',
		'lists.create_new_list.click-to-add': 'Натисніть, щоб додати',
		'lists.create_new_list.propositions-instructions':
			'Тут будуть пункти з попередніх списків, аби Вам легше було їх додавати.',
		'lists.create_new_list.no-recent-suggestions': 'Поки нема пропозицій',
		'lists.create_new_list.set-category-to': 'Змінити категорію:',
		'lists.create_new_list.my-category': 'Моя категорія',
		'lists.create_new_list.remove-selected-warning': 'Видаляємо обрані пункти?',
		// list details
		'lists.details.link-created': 'Посилання скопійовано',
		'lists.details.edit-instruction': 'Натисніть і утримуйте, щоб відредагувати список',
		'lists.details.remove-warning': 'Видаляємо список. Впевнені?'
	}
} as Translations;
