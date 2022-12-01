import { FirebaseUtils, WrongProviderError } from '../../utils/firebase-utils';
import { derived, get, writable } from 'svelte/store';
import { auth, loginClickEvents } from './auth';
import { cleanLocalDataOnLogout } from '../../utils/local-storage-state';
import type { AuthCredential } from 'firebase/auth';
import { t } from '../app/translate';
import { syncLocalDataToDb } from './sync.store';

export class AuthStore {
	public static isLoginModalOpen = writable<boolean>(false);
	private static firebaseUtils = new FirebaseUtils();

	public static isResolved = derived(auth, (auth) => auth.isResolved);
	public static user = derived(auth, (auth) => auth.user);
	public static isLoggedIn = derived(this.user, (user) => !!user);

	public static triggerLoginClicked(): void {
		loginClickEvents.set(new Date().getTime());
	}

	public async loginFacebook(sync: boolean): Promise<any> {
		try {
			const user = await AuthStore.firebaseUtils.signInWithFacebook();
			auth.set({ isResolved: true, user });
			if (sync) {
				await syncLocalDataToDb().catch((err) => console.error(err));
			}
		} catch (err) {
			console.error(err);
			if (err instanceof WrongProviderError) {
				auth.set({
					isResolved: true,
					wrongProvider: { email: err.email, cred: err.cred },
					user: null
				});
			} else {
				auth.set({
					isResolved: true,
					error: get(t)('app.login-popup.failed-to-login-error', {
						code: (err as any).code || 'no-code'
					}),
					user: null
				});
			}
		}
	}

	public async loginGoogle(sync: boolean): Promise<any> {
		try {
			const user = await AuthStore.firebaseUtils.signInGoogle();
			auth.set({ isResolved: true, user });
			if (sync) {
				await syncLocalDataToDb().catch((err) => console.error(err));
			}
		} catch (err) {
			console.error(err);
			if (err instanceof WrongProviderError) {
				auth.set({
					isResolved: true,
					wrongProvider: { email: err.email, cred: err.cred },
					user: null
				});
			} else {
				auth.set({
					isResolved: true,
					error: get(t)('app.login-popup.failed-to-login-error', {
						code: (err as any).code || 'no-code'
					}),
					user: null
				});
			}
		}
	}

	public async linkAccounts(sync: boolean): Promise<any> {
		const authState = get(auth);
		try {
			const user = await AuthStore.firebaseUtils.handleExistingCredentialsError(
				authState?.wrongProvider?.email as string,
				authState.wrongProvider?.cred as AuthCredential
			);
			auth.set({ isResolved: true, user });
			if (sync) {
				await syncLocalDataToDb();
			}
		} catch (err) {
			console.error(err);
			auth.update((prev) => ({ ...prev, error: get(t)('app.login-popup.failed-to-merge-error') }));
		}
	}

	public async signOut(): Promise<any> {
		await AuthStore.firebaseUtils.signOut();
		cleanLocalDataOnLogout();
		auth.set({ isResolved: true, user: null });
	}
}
