import type {
	AppSettings,
	CategoryOption,
	ChecklistSettings,
	ChecklistWithSettings,
	PersistedList,
	Proposition
} from '../types';
import { customCategoryId, otherCategoryId } from './autodetect-data';

export { customCategoryId, otherCategoryId };

export const specialCategories = {
	[customCategoryId]: {},
	[otherCategoryId]: {}
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

export const getListIds = (): PersistedList => {
	const raw = localStorage.getItem('k-garoo/list');
	return JSON.parse(raw || '{}') as PersistedList;
};

export const setListIds = (list: PersistedList): void => {
	const raw = JSON.stringify(list || {});
	localStorage.setItem('k-garoo/list', raw);
};

export const getListData = (id: string): ChecklistWithSettings | null => {
	const raw = localStorage.getItem(`k-garoo/listData/${id}`);
	if (raw) {
		return JSON.parse(raw);
	}
	return null;
};

export const removeListData = (id: string): void => {
	localStorage.removeItem(`k-garoo/listData/${id}`);
};

export const setListData = (list: ChecklistWithSettings): void => {
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

export const getListSettingsLocalStorage = (listId: string): ChecklistSettings | null => {
	const record = localStorage.getItem(`k-garoo/listSettings/${listId}`);
	if (record) {
		return JSON.parse(record) as ChecklistSettings;
	} else {
		return null;
	}
};

export const setListSettingsLocalStorage = (listId: string, settings: ChecklistSettings): void => {
	const str = JSON.stringify(settings);
	localStorage.setItem(`k-garoo/listSettings/${listId}`, str);
};

export const getCategoryOptionsLocalStorage = (): CategoryOption[] => {
	const record = localStorage.getItem('k-garoo/categoryOptions');
	if (record) {
		return JSON.parse(record);
	} else {
		return [];
	}
};

export const setCategoryOptionsLocalStorage = (options: CategoryOption[]): void => {
	const str = JSON.stringify(options);
	localStorage.setItem('k-garoo/categoryOptions', str);
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
