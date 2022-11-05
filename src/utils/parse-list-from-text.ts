import type { CheckListItem } from '../types';
import { getUID } from './get-uid';
import { otherCategoryId, reservedCategories } from './autodetect-data';
import { get } from 'svelte/store';
import { AppSettingsStore } from '../stores/app/app-settings';
import { CategoryAutodetector } from '../stores/checklist-details/category-autodetector';
import { propositionStore } from '../stores/checklist-details/propositions';

export const parseListFromText = (source: string): CheckListItem[] => {
	if (!source) {
		return [];
	}
	const locale = get(AppSettingsStore.lang);
	const autoDetector = new CategoryAutodetector(get(propositionStore), locale as 'en' | 'ua');
	const lines = source.split(/\n/);
	const items: CheckListItem[] = [];
	lines.forEach((line, ind) => {
		const alphanum = getAlphaNumStr(line);
		if (alphanum) {
			const category = autoDetector.detect(alphanum) || {
				...reservedCategories[otherCategoryId],
				name: reservedCategories[otherCategoryId][locale as 'en' | 'ua']
			};
			items.push({
				id: getUID(),
				itemDescription: alphanum,
				orderAdded: ind * 200,
				checked: false,
				category
			});
		}
	});
	return items;
};

function getAlphaNumStr(s: string): string | null {
	if (!s?.length) {
		return null;
	}
	const [first, last] = getFirstAndLastAlphaNumeric(s);
	const res = s.slice(first, last + 1);
	if (!res.length) {
		return null;
	}
	return res;
}

const alphaNumBase = /[A-Za-z0-9]/;
const alphaNum = () => new RegExp(alphaNumBase);
function getFirstAndLastAlphaNumeric(s: string): [number, number] {
	const l = s.length;
	let first = 0,
		last = l - 1;
	for (let i = 0; i < l; i++) {
		if (new RegExp(/[A-Za-z0-9]/).test(s[i])) {
			first = i;
			break;
		}
	}
	for (let i = 1; i <= l; i++) {
		if (new RegExp(/[A-Za-z0-9]/).test(s[l - i])) {
			last = l - i;
			break;
		}
	}
	return [first, last];
}
