import { get, writable } from 'svelte/store';
import type { AppUser } from '../../types/auth';
import type { AuthCredential } from 'firebase/auth';
import {
	cleanLocalDataOnLogout,
	getUserLocalStorage,
	setUserLocalStorage
} from '../../utils/local-storage-state';

export const auth = writable<{
	isResolved: boolean;
	user: AppUser | null;
	wrongProvider?: {
		email: string;
		cred: AuthCredential;
	};
	error?: string;
	isSessionExpired?: boolean;
}>({
	isResolved: false,
	user: null
});

export const loginClickEvents = writable<number | null>();

export const loadUserIfNotResolved = async (f = fetch, browser: boolean): Promise<void> => {
	if (!get(auth)?.isResolved) {
		await loadUserFromSession(f, browser);
	}
};

export const loadUserFromSession = async (f = fetch, browser: boolean): Promise<void> => {
	try {
		const userResp = await f('/api/v1/session', { method: 'GET' });
		const user = await userResp.json();
		auth.set({ isResolved: true, user });
		if (browser) {
			const localUser = await getUserLocalStorage();
			if (!user && !!localUser) {
				cleanLocalDataOnLogout();
				auth.update((prev) => ({ ...prev, isSessionExpired: true }));
				loginClickEvents.set(new Date().getTime());
			}
			if (!localUser && !!user) {
				await setUserLocalStorage(user);
			}
		}
	} catch (err) {
		console.error(err);
	}
};
