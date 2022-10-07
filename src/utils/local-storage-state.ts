import { browser } from '$app/environment';
import type { AppSettings, CheckList, KGarooState, Proposition } from '../types';
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
			theme: undefined,
			version: 0
		},
		appInstructions: {
			isAddFromPropositionsViewed: false,
			isEditListFromDetailsViewed: false
		}
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

export const getAppSettings = (): AppSettings | null => {
	const record = localStorage.getItem('k-garoo/appSettings');
	if (record) {
		return JSON.parse(record);
	} else {
		return null;
	}
};

export const setAppSettings = (settings: AppSettings): void => {
	const str = JSON.stringify(settings);
	localStorage.setItem('k-garoo/appSettings', str);
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

export const getPropositions = (): Proposition[] => {
	const record = localStorage.getItem('k-garoo/propositions');
	if (record) {
		return JSON.parse(record) as Proposition[];
	} else {
		return [];
	}
};

export const setPropositions = (props: Proposition[]): void => {
	const str = JSON.stringify(props || []);
	localStorage.setItem('k-garoo/propositions', str);
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
