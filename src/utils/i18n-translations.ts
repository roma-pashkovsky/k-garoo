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
		'app.sections.settings': 'Settings',
		'app.sections.login': 'Login',
		'app.lang-placeholder': 'Language',
		'app.initial-lang.header': 'Select your language',
		'app.initial-lang.disclaimer': 'You can always change it in "Settings"',
		'app.ok.long': 'Okay',
		'lists.no_lists': 'No lists.',
		'lists.no_lists_cta_1': "Let's",
		'lists.no_lists_cta_link': 'add one.',
		'lists.remove-list': 'Remove',
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
		'lists.details.remove-warning': 'Will remove list. Are you sure?',
		'lists.details.by-category': 'By category',
		'lists.details.link-to-list': 'Get link to list',
		'lists.details.duplicate-item-badge': 'Duplicate item',
		'lists.details.added-toast': 'Added item',
		// decode list
		'lists.decode.page-title': 'Display list',
		// settings
		'settings.header.language': 'Language',
		'settings.header.theme': 'Theme',
		'settings.header.theme-dark': 'Dark',
		'settings.header.theme-light': 'Light'
	},
	ua: {
		'app.logo': 'Списки',
		'app.my_lists': 'Мої списки',
		'app.sections.lists': 'Списки',
		'app.sections.settings': 'Налаштування',
		'app.sections.login': 'Увійти',
		'app.lang-placeholder': 'Мова',
		'app.initial-lang.header': 'Оберіть мову',
		'app.initial-lang.disclaimer': 'Її можна змінити в розділі "Налаштування" в будь-який момент.',
		'app.ok.long': 'Гаразд',
		'lists.no_lists': 'Поки що тут немає списків.',
		'lists.no_lists_cta_1': 'Нумо',
		'lists.no_lists_cta_link': 'створимо список.',
		'lists.remove-list': 'Видалити',
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
		'lists.details.remove-warning': 'Видаляємо список. Впевнені?',
		'lists.details.by-category': 'За категоріями',
		'lists.details.link-to-list': 'Посилання',
		'lists.details.duplicate-item-badge': 'Пункт дублюється',
		'lists.details.added-toast': 'Додано',
		// decode list
		'lists.decode.page-title': 'Показати список',
		// settings
		'settings.header.language': 'Мова',
		'settings.header.theme': 'Тема',
		'settings.header.theme-dark': 'Темна',
		'settings.header.theme-light': 'Світла'
	}
} as Translations;
