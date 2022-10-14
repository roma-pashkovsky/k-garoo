import { AppSettingsStore } from '../stores/app/app-settings';
import { get } from 'svelte/store';
import { t } from '../stores/app/translate';

export const getDefaultListName = (): string => {
	if (Intl === undefined || Intl.DateTimeFormat === undefined) {
		return get(t)('lists.create_new_list.header');
	}
	const date = new Date();
	const formatter = new Intl.DateTimeFormat(get(AppSettingsStore.lang), {
		dateStyle: 'short',
		timeStyle: 'short'
	});
	console.log(formatter.formatToParts(date));
	return formatter.format(date);
};
