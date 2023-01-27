import type { Load } from '@sveltejs/kit';
import { loadUserFromSession } from '../../../stores/login/auth';
import { browser } from '$app/environment';

export const load: Load = async ({ parent, fetch }) => {
	await loadUserFromSession(fetch, browser);
	await parent();
};
