import type {
	AppSettings,
	CategoryOption,
	ChecklistSettings,
	ChecklistWithSettings,
	PersistedList,
	Proposition
} from '../types';
import type { AppUser } from '../types/auth';
import { customCategoryId, otherCategoryId } from './autodetect-data';
import { getChecklistSearchIndex } from './get-checklist-search-index';
import type { SyncTask } from './api/client/sync-task-types';

export { customCategoryId, otherCategoryId };

export const specialCategories = {
	[customCategoryId]: {},
	[otherCategoryId]: {}
};

// use for rapid access, when searching
const listDataLocalCache: { [id: string]: ChecklistWithSettings | null } = {};

export const setUserLocalStorage = (user: AppUser): Promise<void> => {
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			const str = JSON.stringify(user);
			localStorage.setItem('k-garoo/user', str);
			resolve();
		});
	});
};

export const cleanUserLocalStorage = (): Promise<void> => {
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			localStorage.removeItem('k-garoo/user');
			resolve();
		});
	});
};

export const getUserLocalStorage = (): Promise<AppUser | null> => {
	return new Promise<AppUser | null>((resolve) => {
		requestAnimationFrame(() => {
			const str = localStorage.getItem('k-garoo/user');
			if (str) {
				const parsed = JSON.parse(str);
				resolve(parsed);
			} else {
				resolve(null);
			}
		});
	});
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
	if (window && 'localStorage' in window) {
		const str = JSON.stringify(settings);
		localStorage.setItem('k-garoo/appSettings', str);
	}
};

export const getListIds = (search?: string | null): Promise<PersistedList> => {
	return new Promise<PersistedList>((resolve) => {
		requestAnimationFrame(() => {
			const raw = localStorage.getItem('k-garoo/list');
			const result = JSON.parse(raw || '{}') as PersistedList;
			if (search?.length) {
				const lowerCaseSearch = search.toLowerCase();
				for (const listId in result) {
					const list = getListDataThroughLocalCache(listId);
					const searchIndex = getChecklistSearchIndex(list);
					if (searchIndex.indexOf(lowerCaseSearch) >= 0) {
						result[listId].name = list?.name;
					} else {
						delete result[listId];
					}
				}
			}
			resolve(result);
		});
	});
};

export const setListIds = (list: PersistedList | null): void => {
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

const getListDataThroughLocalCache = (id: string): ChecklistWithSettings | null => {
	if (!listDataLocalCache[id]) {
		listDataLocalCache[id] = getListData(id);
	}
	return listDataLocalCache[id];
};

export const removeListData = (id: string): void => {
	localStorage.removeItem(`k-garoo/listData/${id}`);
};

export const setListData = (list: ChecklistWithSettings): void => {
	const raw = JSON.stringify(list);
	delete listDataLocalCache[list.id];
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

export const addSyncTask = async (task: SyncTask): Promise<void> => {
	return new Promise((resolve) => {
		if (!localStorage) {
			resolve();
		}
		requestAnimationFrame(() => {
			localStorage.setItem(`k-garoo/syncTasks/${task.id}`, JSON.stringify(task));
			resolve();
		});
	});
};

export const removeSyncTask = (taskId: string): Promise<void> => {
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			localStorage.removeItem(`k-garoo/syncTasks/${taskId}`);
			resolve();
		});
	});
};

export const getSyncTasks = (): Promise<SyncTask[]> => {
	return new Promise<SyncTask[]>((resolve) => {
		requestAnimationFrame(() => {
			const l = localStorage.length;
			const syncTaskKeys: string[] = [];
			for (let i = 0; i < l; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith('k-garoo') && key.includes('syncTasks')) {
					syncTaskKeys.push(key);
				}
			}
			const tasks = syncTaskKeys
				.map((k) => localStorage.getItem(k))
				.map((str) => JSON.parse(str || ''));
			resolve(tasks);
		});
	});
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

export const cleanLocalDataOnLogout = (): void => {
	const forRemove: string[] = [];
	const l = localStorage.length;
	for (let i = 0; i < l; i++) {
		const key = localStorage.key(i);
		if (
			key &&
			key.startsWith('k-garoo') &&
			(key.includes('list') ||
				key.includes('categoryOptions') ||
				key.includes('syncTasks') ||
				key.includes('user'))
		) {
			forRemove.push(key);
		}
	}
	forRemove.forEach((key) => {
		localStorage.removeItem(key);
	});
};
