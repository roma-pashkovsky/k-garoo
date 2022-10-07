import { derived } from 'svelte/store';
import { AppSettingsStore } from './app-settings';
import { pluralize } from '../../utils/pluralize';

export const p = derived(
	AppSettingsStore.lang,
	($locale) => (word: string, count: number) => pluralize($locale as string, word, count)
);
