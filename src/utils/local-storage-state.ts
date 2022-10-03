import { browser } from '$app/environment';
import type { CheckList, KGarooState } from '../types';
import { customCategoryId, otherCategoryId } from './autodetect-data';

export { customCategoryId, otherCategoryId };

export const getInitialState = (): KGarooState => {
	return {
		listData: {},
		listIds: [],
		checklistSettings: {
			isGroupByCategory: false,
			isColorsForCategories: false,
			hasSeenDemo: false
		},
		categoryOptions: [],
		propositions: [],
		appSettings: {
			lang: undefined,
			isLocaleSet: false,
			theme: 'light'
		},
		appInstructions: {
			isAddFromPropositionsViewed: false,
			isEditListFromDetailsViewed: false
		},
		appVersion: 0
	};
};

export const specialCategories = {
	[customCategoryId]: {},
	[otherCategoryId]: {}
};

export const getState = (): KGarooState => {
	if (!browser) {
		return {} as KGarooState;
	}
	return JSON.parse(localStorage.getItem('k-garoo') || '{}');
};

export const setState = (state: KGarooState): void => {
	if (!browser) {
		return;
	}
	const str = JSON.stringify(state);
	localStorage.setItem('k-garoo', str);
};

export const getListIds = (): string[] => {
	const raw = localStorage.getItem('k-garoo/listIds');
	return JSON.parse(raw || '[]') as string[];
};

export const setListIds = (ids: string[]): void => {
	const raw = JSON.stringify(ids || []);
	localStorage.setItem('k-garoo/listIds', raw);
};

export const getListData = (id: string): CheckList | null => {
	const raw = localStorage.getItem(`k-garoo/listData/${id}`);
	if (raw) {
		return JSON.parse(raw);
	}
	return null;
};

export const removeListData = (id: string): void => {
	localStorage.removeItem(`k-garoo/listData/${id}`);
};

export const setListData = (list: CheckList): void => {
	const raw = JSON.stringify(list);
	localStorage.setItem(`k-garoo/listData/${list.id}`, raw);
};

export const cleanAllLocalData = (): void => {
	console.log(localStorage.length);
	const forRemove: string[] = [];
	const l = localStorage.length;
	for (let i = 0; i < l; i++) {
		const key = localStorage.key(i);
		if (key && key.startsWith('k-garoo')) {
			forRemove.push(key);
		}
	}
	forRemove.forEach((key) => {
		localStorage.removeItem(key);
	});
};
