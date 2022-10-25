import { writable } from 'svelte/store';
import type { AppUser } from '../../types/auth';

export const auth = writable<{ isResolved: boolean; user: AppUser | null }>({
	isResolved: false,
	user: null
});

export const loadUserFromSession = async (f = fetch): Promise<void> => {
	try {
		const userResp = await f('/api/v1/session', { method: 'GET' });
		const user = await userResp.json();
		auth.set({ isResolved: true, user });
	} catch (err) {
		console.error(err);
	}
};
