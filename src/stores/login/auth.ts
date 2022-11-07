import { get, writable } from 'svelte/store';
import type { AppUser } from '../../types/auth';
import type { AuthCredential } from 'firebase/auth';

export const auth = writable<{
	isResolved: boolean;
	user: AppUser | null;
	wrongProvider?: {
		email: string;
		cred: AuthCredential;
	};
	error?: string;
}>({
	isResolved: false,
	user: null
});

export const loadUserIfNotResolved = async (f = fetch): Promise<void> => {
	if (!get(auth)?.isResolved) {
		await loadUserFromSession(f);
	}
};

export const loadUserFromSession = async (f = fetch): Promise<void> => {
	try {
		const userResp = await f('/api/v1/session', { method: 'GET' });
		const user = await userResp.json();
		auth.set({ isResolved: true, user });
		console.log('user loaded');
	} catch (err) {
		console.error(err);
	}
};
