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
		'app.initial-popup.title': 'Welcome to K-garoo of the Checklists!',
		'app.initial-popup.personalize':
			"We're excited to meet you! Let's personalize your experience.",
		'app.initial-popup.settings-disclaimer': 'You can always change it in "Settings"',
		'app.ok.long': 'Okay',
		'app.undo': 'Undo',
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
		'lists.details.save-as-new-list-warning':
			'Selected items will be saved as a new list, and you will be taken to the new list. This list will remain unchanged. Ok?',
		'lists.details.by-category': 'By category',
		'lists.details.hide-crossed-out': 'Hide crossed out',
		'lists.details.show-crossed-out': 'Show crossed out',
		'lists.details.link-to-list': 'Get link to list',
		'lists.details.show-me-around': 'Show me around',
		'lists.details.duplicate-item-badge': 'Duplicate item',
		'lists.details.added-toast': 'Added item',
		'lists.details.removed-toast': 'Removed',
		'lists.details.changed-category-toast': 'Changed category',
		'lists.details.demo.add': 'Double click to start adding items',
		'lists.details.demo.exit-editor': 'Swipe left to exit',
		'lists.details.demo.submit-editor': 'Swipe right to submit',
		'lists.details.demo.edit-item': 'Press and hold to edit item',
		'lists.details.demo.remove-item': 'Swipe left to remove an item',
		'lists.details.demo.batch-edit': 'Swipe right to edit several items at once',
		'lists.details.demo.use-categories': 'You can view your list by categories',
		'lists.details.demo.got-it': 'Got it!',
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
		'app.initial-popup.title': 'Вітаємо, це K-garoo - Майстер Списків!',
		'app.initial-popup.personalize': 'Дуже раді Вас бачити! Давайте налаштуємо все під Вас.',
		'app.initial-popup.settings-disclaimer': 'Це все потім можна змінити в розділі "Налаштування".',
		'app.ok.long': 'Гаразд',
		'app.undo': 'Скасувати',
		'lists.no_lists': 'Поки що тут немає списків.',
		'lists.no_lists_cta_1': 'Нумо',
		'lists.no_lists_cta_link': 'створимо список.',
		'lists.remove-list': 'Видалити',
		'lists.remove-warning': 'Видаляємо {{list}}. Впевнені?',
		'lists.details.save-as-new-list-warning':
			'Зберігаємо виділені пункти в новий список і переходимо до нього. Цей список залишиться без змін. Гаразд?',
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
		'lists.details.hide-crossed-out': 'Сховати закреслені',
		'lists.details.show-crossed-out': 'Показати закреслені',
		'lists.details.link-to-list': 'Посилання',
		'lists.details.show-me-around': 'Що тут де?',
		'lists.details.duplicate-item-badge': 'Пункт дублюється',
		'lists.details.added-toast': 'Додано',
		'lists.details.removed-toast': 'Видалено',
		'lists.details.changed-category-toast': 'Категорію змінено',
		'lists.details.demo.add': 'Клацніть двічі, щоб додати пункт',
		'lists.details.demo.exit-editor': 'Свайп ліворуч, щоб вийти',
		'lists.details.demo.submit-editor': 'Свайп праворуч, щоб затвердити',
		'lists.details.demo.edit-item': 'Натисніть і утримуйте, щоб відредагувати',
		'lists.details.demo.remove-item': 'Свайп ліворуч, щоб видалити пункт',
		'lists.details.demo.batch-edit': 'Свайп праворуч, щоб відредагувати одразу кілька пунктів',
		'lists.details.demo.use-categories': 'Список можна переглянути за категоріями',
		'lists.details.demo.got-it': 'Добре',
		// decode list
		'lists.decode.page-title': 'Показати список',
		// settings
		'settings.header.language': 'Мова',
		'settings.header.theme': 'Тема',
		'settings.header.theme-dark': 'Темна',
		'settings.header.theme-light': 'Світла'
	}
} as Translations;
