import { get, writable } from 'svelte/store';
import type { CategoryOption } from '../../types';
import { auth } from '../login/auth';
import {
	getCategoryOptionsLocalStorage,
	setCategoryOptionsLocalStorage
} from '../../utils/local-storage-state';
import { appFetch } from '../../utils/app-fetch';

export const categoryOptionsByUser = writable<CategoryOption[]>([]);

export const loadCategoryOptions = async (browser: boolean, f = fetch): Promise<void> => {
	const user = get(auth).user;
	if (user) {
		const res = await f('/api/v1/category-options', { method: 'GET' });
		const options = await res.json();
		categoryOptionsByUser.set(options);
	} else if (browser) {
		const state = getCategoryOptionsLocalStorage();
		categoryOptionsByUser.set(state);
	}
};

export const addCategoryOption = async (option: CategoryOption): Promise<void> => {
	const user = get(auth).user;
	await addCategoryOptionLocal(option);
	categoryOptionsByUser.update((old) => [option, ...(old || [])]);
	if (user) {
		try {
			await appFetch(
				'/category-options',
				{ method: 'POST', body: JSON.stringify(option) },
				fetch,
				10000,
				option.id
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
	await appFetch('/category-options', { method: 'DELETE', body }, fetch, 10000, optionId);
};
