import { browser } from '$app/environment';
import type { CheckList, KGarooState } from '../types';
import { customCategoryId, otherCategoryId } from './autodetect-data';

export { customCategoryId, otherCategoryId };

export const getInitialState = (): KGarooState => {
	return {
		listData: {},
		listIds: [],
		checklistSettings: {
			isGroupByCategory: false
		},
		categoryOptions: [],
		propositions: [],
		appSettings: {
			lang: undefined
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
	return getState().listIds;
};

export const getList = (id: string): CheckList => {
	return getState().listData[id];
};
