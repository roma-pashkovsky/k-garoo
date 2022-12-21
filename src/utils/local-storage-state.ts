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
import type { ApiSyncTask } from '../types/api-sync-task';

export { customCategoryId, otherCategoryId };

export const specialCategories = {
	[customCategoryId]: {},
	[otherCategoryId]: {}
};

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

export const getListIds = (): Promise<PersistedList> => {
	return new Promise<PersistedList>((resolve) => {
		requestAnimationFrame(() => {
			const raw = localStorage.getItem('k-garoo/list');
			const result = JSON.parse(raw || '{}') as PersistedList;
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

export const addSyncTask = async (task: ApiSyncTask): Promise<void> => {
	return new Promise((resolve) => {
		if (!localStorage) {
			resolve();
		}
		requestAnimationFrame(() => {
			localStorage.setItem(`k-garoo/syncTasks/${task.groupId}%${task.ts}`, JSON.stringify(task));
			resolve();
		});
	});
};

export const removeSyncTask = (task: ApiSyncTask): Promise<void> => {
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			localStorage.removeItem(`k-garoo/syncTasks/${task.groupId}%${task.ts}`);
			resolve();
		});
	});
};

export const getSyncTasks = (): Promise<ApiSyncTask[]> => {
	return new Promise<ApiSyncTask[]>((resolve) => {
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
