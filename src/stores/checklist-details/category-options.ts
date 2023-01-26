import { get, writable } from 'svelte/store';
import type { CategoryOption } from '../../types';
import { auth } from '../login/auth';
import {
	getCategoryOptionsLocalStorage,
	setCategoryOptionsLocalStorage
} from '../../utils/local-storage-state';
import { appFetch } from '../../utils/app-fetch';
import { getUID } from '../../utils/get-uid';
import { SyncTaskTypes } from '../../utils/api/client/sync-task-types';
import type {
	CreateCategoryOptionSyncTask,
	DeleteCategoryOptionSyncTask
} from '../../utils/api/client/sync-task-types';
import { offline } from '../offline-mode/offline-mode.store';

export const categoryOptionsByUser = writable<CategoryOption[]>([]);

export const loadCategoryOptions = async (browser: boolean, f = fetch): Promise<void> => {
	let resultOptions: CategoryOption[] = [];
	if (browser) {
		resultOptions = getCategoryOptionsLocalStorage();
	}
	const user = get(auth).user;
	if (user && !get(offline)) {
		try {
			resultOptions = await appFetch('/category-options', { method: 'GET' }, f, 7000);
			if (browser) {
				setCategoryOptionsLocalStorage(resultOptions);
			}
		} catch (e) {
			console.error(e);
		}
	}
	categoryOptionsByUser.set(resultOptions);
};

export const addCategoryOption = async (option: CategoryOption): Promise<void> => {
	const user = get(auth).user;
	await addCategoryOptionLocal(option);
	categoryOptionsByUser.update((old) => [option, ...(old || [])]);
	if (user) {
		try {
			const syncTask: CreateCategoryOptionSyncTask = {
				id: getUID(),
				type: SyncTaskTypes.CREATE_CATEGORY_OPTION,
				payload: option,
				ts: new Date().getTime()
			};
			await appFetch(
				'/category-options',
				{ method: 'POST', body: JSON.stringify(option) },
				fetch,
				10000,
				syncTask
			);
		} catch (e) {
			console.error(e);
		}
	}
};

async function addCategoryOptionLocal(option: CategoryOption): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			const oldOptions = getCategoryOptionsLocalStorage();
			const newOptions = [option, ...(oldOptions || [])];
			setCategoryOptionsLocalStorage(newOptions);
			resolve();
		});
	});
}

/**
 * Remove option
 */

export const removeCategoryOption = async (optionId: string): Promise<void> => {
	categoryOptionsByUser.update((prev) => prev.filter((op) => op.id !== optionId));
	await removeCategoryOptionLocal(optionId);
	const user = get(auth).user;
	if (user) {
		await removeCategoryOptionAPI(optionId);
	}
};

export const removeCategoryOptionLocal = (optionId: string): Promise<void> => {
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			const options = getCategoryOptionsLocalStorage();
			const newOptions = (options || []).filter((op) => op.id !== optionId);
			setCategoryOptionsLocalStorage(newOptions);
			resolve();
		});
	});
};

export const removeCategoryOptionAPI = async (optionId: string): Promise<void> => {
	const body = JSON.stringify({ optionId });
	const syncTask: DeleteCategoryOptionSyncTask = {
		id: getUID(),
		type: SyncTaskTypes.DELETE_CATEGORY_OPTION,
		payload: optionId,
		ts: new Date().getTime()
	};
	try {
		await appFetch('/category-options', { method: 'DELETE', body }, fetch, 10000, syncTask);
	} catch (e) {
		console.error(e);
	}
};
