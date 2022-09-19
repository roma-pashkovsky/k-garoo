import { derived } from 'svelte/store';
import { locale } from './i18n';

const pluralizations: {
	[locale: string]: { [word: string]: { default: string; special: { [count: number]: string } } };
} = {
	['en']: {
		item: {
			default: 'items',
			special: {
				1: 'item'
			}
		}
	},
	['ua']: {
		item: {
			default: 'пунктів',
			special: {
				1: 'пункт',
				2: 'пункти',
				3: 'пункти',
				4: 'пункти'
			}
		}
	}
};

const pluralize = (l: string, word: string, count: number): string => {
	if (!pluralizations[l] || !pluralizations[l][word]) {
		throw new Error('No pluralization for ' + l + ', ' + word);
	}
	if (pluralizations[l][word].special[count]) {
		return `${count} ${pluralizations[l][word].special[count]}`;
	}
	return `${count} ${pluralizations[l][word].default}`;
};

export const p = derived(
	locale,
	($locale) => (word: string, count: number) => pluralize($locale, word, count)
);
