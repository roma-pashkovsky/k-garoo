import { browser } from '$app/environment';
import type { CheckList, KGarooState } from '../types';

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
