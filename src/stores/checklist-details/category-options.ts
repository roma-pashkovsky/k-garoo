import { get, writable } from 'svelte/store';
import type { CategoryOption } from '../../types';
import { auth } from '../login/auth';
import {
	getCategoryOptionsLocalStorage,
	setCategoryOptionsLocalStorage
} from '../../utils/local-storage-state';

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
	if (user) {
		await fetch('/api/v1/category-options', { method: 'POST', body: JSON.stringify(option) });
	} else {
		await addCategoryOptionLocal(option);
	}
	categoryOptionsByUser.update((old) => [option, ...old]);
};

async function addCategoryOptionLocal(option: CategoryOption): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			const oldOptions = getCategoryOptionsLocalStorage();
			const newOptions = [option, ...oldOptions];
			setCategoryOptionsLocalStorage(newOptions);
		});
	});
}
