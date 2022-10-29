export type Translations = {
	[locale: string]: {
		[key: string]: string;
	};
};

export default {
	en: {
		'app.logo': 'Easy checklists',
		'app.my_lists': 'My lists',
		'app.basic-confirm': 'Are you sure?',
		'app.sections.lists': 'Lists',
		'app.sections.settings': 'Settings',
		'app.sections.about': 'About',
		'app.sections.support-ua': 'Support Ukraine',
		'app.sections.login': 'Login',
		'app.toasts.success': 'Success',
		'app.toasts.failed': 'Failed',
		'app.user-menu.logout': 'Logout',
		'app.lang-placeholder': 'Language',
		'app.initial-popup.title': 'Welcome to K-garoo of the Checklists!',
		'app.initial-popup.personalize':
			"We're excited to meet you! Let's personalize your experience.",
		'app.initial-popup.settings-disclaimer': 'You can always change it in "Settings"',
		'app.initial-popup.add-to-main-recommend':
			"It's easier to use K-Garoo, when you add it to your main screen.",
		'app.initial-popup.add-to-main-section-title': "Adding app to your phone's main screen",
		'app.ok.long': 'Okay',
		'app.undo': 'Undo',
		'app.later': 'Later',
		'app.show-me-how': 'Show me how',
		'app.login-popup.title': 'Login',
		'app.login-popup.facebook-button': 'Login with Facebook',
		'app.login-popup.sync-data-checkbox': 'Sync lists to my account',
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
		'lists.details.colors-for-categories': 'Colors for categories',
		'lists.details.link-to-list': 'Get link to list',
		'lists.details.duplicate': 'Duplicate list',
		'lists.details.share-list': 'Share list',
		'lists.details.share-list-login': 'Login',
		'lists.details.show-me-around': 'Show me around',
		'lists.details.duplicate-item-badge': 'Duplicate item',
		'lists.details.add-item-placeholder': 'Add item',
		'lists.details.added-toast': 'Added item',
		'lists.details.add-to-my-lists-button': 'Add to my lists',
		// batch edit
		'lists.details.batch-remove-button': 'Remove',
		'lists.details.move-to-new-list': 'Add to new list',
		'lists.details.removed-toast': 'Removed',
		'lists.details.changed-category-toast': 'Changed category',
		'lists.details.demo.add': 'Double click to start adding items',
		'lists.details.demo.exit-editor': 'Swipe left to exit',
		'lists.details.demo.exit-editor.md': 'Double click to exit',
		'lists.details.demo.submit-editor': 'Swipe right to submit',
		'lists.details.demo.submit-editor.md': `Press 'Enter' to submit`,
		'lists.details.demo.edit-item': 'Press and hold to edit item',
		'lists.details.demo.remove-item': 'Swipe left to remove an item',
		'lists.details.demo.batch-edit': 'Swipe right to edit several items at once',
		'lists.details.demo.batch-edit.md': 'Click to edit several items',
		'lists.details.demo.use-categories': 'You can view your list by categories',
		'lists.details.demo.got-it': 'Got it!',
		// decode list
		'lists.decode.page-title': 'Display list',
		// settings
		'settings.header.language': 'Language',
		'settings.header.theme': 'Theme',
		'settings.header.theme-dark': 'Dark',
		'settings.header.theme-light': 'Light',
		'settings.header.data': 'Data',
		'settings.data.clean-data-button': 'Clean all data',
		'settings.data.clean-data.warning-title': 'This action cannot be undone',
		'settings.data.clean-data.warning-body':
			'All your local data will be removed from this device. If you are logged in, your data on the server and your account will be removed as well.',
		'settings.data.clean-data.toast-success': 'Cleaned all data',
		'settings.data.clean-data.toast-failed': 'Failed to remove data',
		'settings.data.failed-to-remove-account-prompt': `Failed to remove the account. Try logging in again and selecting "Clean all data"`,
		// share list
		'share-list.modal.title': 'Share this list',
		'share-list.modal.user-search-placeholder': 'Start typing user name...',
		'share-list.modal.recent': 'Recent',
		'share-list.modal.share-button': 'Share',
		'share-list.modal.unshare-button': 'Unshare',
		'share-list.requests.title': 'Requests',
		'share-list.requests.empty': 'No list requests',
		'share-list.requests.shared-by': 'Shared by:',
		'share-list.requests.accept-button': 'Accept',
		'share-list.requests.reject-button': 'Reject',
		'share-list.requests.block-user-button': 'Block user',
		// stop list
		'stop-list.page.title': 'Blocked',
		'stop-list.page.empty': 'No blocked users',
		'stop-list.item.unblock-button': 'Unblock'
	},
	ua: {
		'app.logo': 'Списки',
		'app.my_lists': 'Мої списки',
		'app.basic-confirm': 'Впевнені?',
		'app.sections.lists': 'Списки',
		'app.sections.settings': 'Налаштування',
		'app.sections.about': 'Про нас',
		'app.sections.support-ua': 'Підтримка України',
		'app.sections.login': 'Вхід',
		'app.toasts.success': 'Успішно',
		'app.toasts.failed': 'Помилка',
		'app.user-menu.logout': 'Вихід',
		'app.lang-placeholder': 'Мова',
		'app.initial-popup.title': 'Вітаємо, це K-garoo - Майстер Списків!',
		'app.initial-popup.personalize': 'Дуже раді Вас бачити! Давайте налаштуємо все під Вас.',
		'app.initial-popup.settings-disclaimer': 'Це все потім можна змінити в розділі "Налаштування".',
		'app.initial-popup.add-to-main-recommend':
			'Буде зручніше, якщо додати K-Garoo на головний екран.',
		'app.initial-popup.add-to-main-section-title': 'Як додати застосунок на головний екран',
		'app.ok.long': 'Гаразд',
		'app.undo': 'Скасувати',
		'app.later': 'Пізніше',
		'app.show-me-how': 'Як це зробити?',
		'app.login-popup.title': 'Вхід',
		'app.login-popup.facebook-button': 'Вхід через Facebook',
		'app.login-popup.sync-data-checkbox': 'Завантажити списки у мій акаунт',
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
		'lists.details.colors-for-categories': 'Кольори для категорій',
		'lists.details.link-to-list': 'Посилання',
		'lists.details.duplicate': 'Дублювати список',
		'lists.details.share-list': 'Поділитись',
		'lists.details.share-list-login': 'Увійти',
		'lists.details.show-me-around': 'Що тут де?',
		'lists.details.duplicate-item-badge': 'Пункт дублюється',
		'lists.details.added-toast': 'Додано',
		'lists.details.add-item-placeholder': 'Додати пункт',
		'lists.details.add-to-my-lists-button': 'Додати у свої списки',
		// batch edit
		'lists.details.batch-remove-button': 'Видалити',
		'lists.details.move-to-new-list': 'У новий список',
		'lists.details.removed-toast': 'Видалено',
		'lists.details.changed-category-toast': 'Категорію змінено',
		'lists.details.demo.add': 'Клацніть двічі, щоб додати пункт',
		'lists.details.demo.exit-editor': 'Свайп ліворуч, щоб вийти',
		'lists.details.demo.exit-editor.md': 'Клацніть двічі, щоб вийти',
		'lists.details.demo.submit-editor': 'Свайп праворуч, щоб затвердити',
		'lists.details.demo.submit-editor.md': `'Enter', щоб затвердити`,
		'lists.details.demo.edit-item': 'Натисніть і утримуйте, щоб відредагувати',
		'lists.details.demo.remove-item': 'Свайп ліворуч, щоб видалити пункт',
		'lists.details.demo.batch-edit': 'Свайп праворуч, щоб відредагувати одразу кілька пунктів',
		'lists.details.demo.batch-edit.md': 'Натисніть, щоб відредагувати кілька пунктів одразу',
		'lists.details.demo.use-categories': 'Список можна переглянути за категоріями',
		'lists.details.demo.got-it': 'Добре',
		// decode list
		'lists.decode.page-title': 'Показати список',
		// settings
		'settings.header.language': 'Мова',
		'settings.header.theme': 'Тема',
		'settings.header.theme-dark': 'Темна',
		'settings.header.theme-light': 'Світла',
		'settings.header.data': 'Дані',
		'settings.data.clean-data-button': 'Видалити всі дані',
		'settings.data.clean-data.warning-title': 'Цю дію не можна скасувати',
		'settings.data.clean-data.warning-body':
			'Всі локальні дані буде видалено з пристрою. Якщо ви увійшли в систему, Ваші дані на сервері і Ваш акаунт буде видалено.',
		'settings.data.clean-data.toast-success': 'Дані видалено',
		'settings.data.clean-data.toast-failed': 'Не вдалося видалити дані',
		'settings.data.failed-to-remove-account-prompt': `Не вдалося видалити акаунт. Спробуйте заново увійти в систему і натисніть "Видалити дані"`,
		// share list
		'share-list.modal.title': 'Поділитися списком',
		'share-list.modal.user-search-placeholder': 'Почніть вводити імʼя...',
		'share-list.modal.recent': 'Нещодавні',
		'share-list.modal.share-button': 'Поділитись',
		'share-list.modal.unshare-button': 'Скасувати',
		'share-list.requests.title': 'Запити',
		'share-list.requests.empty': 'Немає запитів на списки',
		'share-list.requests.shared-by': 'Поділився:',
		'share-list.requests.accept-button': 'Прийняти',
		'share-list.requests.reject-button': 'Відхилити',
		'share-list.requests.block-user-button': 'Заблокувати',
		// stop list
		'stop-list.page.title': 'Заблоковані',
		'stop-list.page.empty': 'Немає заблокованих користувачів',
		'stop-list.item.unblock-button': 'Розблокувати'
	}
} as Translations;
