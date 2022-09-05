import { derived, writable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import translations from './i18n-translations';

export const defaultLocale = 'en';
export const locale = writable(defaultLocale);
export const locales = Object.keys(translations);

export function translate(locale: string, key: string, vars: { [key: string]: string } = {}) {
	// Let's throw some errors if we're trying to use keys/locales that don't exist.
	// We could improve this by using Typescript and/or fallback values.
	if (!key) throw new Error('no key provided to $t()');
	if (!locale) throw new Error(`no translation for key "${key}" (locale - ${locale})`);

	// Grab the translation from the translations object.
	let text = translations[locale][key];

	if (!text) throw new Error(`no translation found for ${locale}.${key}`);

	// Replace any passed in variables in the translation string.
	Object.keys(vars).map((k) => {
		const regex = new RegExp(`{{${k}}}`, 'g');
		text = text.replace(regex, vars[k]);
	});

	return text;
}

export const t: Readable<(key: string, vars?: any) => string> = derived(
	locale,
	($locale) =>
		(key: string, vars = {}) =>
			translate($locale, key, vars)
);
