import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { translate } from '../../utils/i18n';
import { AppSettingsStore, defaultLocale } from './app-settings';

export const t: Readable<(key: string, vars?: any) => string> = derived(
	AppSettingsStore.lang,
	($locale) =>
		(key: string, vars = {}) =>
			translate($locale || defaultLocale, key, vars)
);
