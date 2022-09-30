import { FirebaseUtils } from '../../utils/firebase-utils';
import type { AppUser } from '../../types/auth';
import { derived, writable } from 'svelte/store';

export class AuthStore {
	public static async checkAuth(): Promise<void> {
		const userId = await this.firebaseUtils.resolveAuth();
		if (userId) {
			const user = await this.firebaseUtils.readOnce<AppUser>(`users/${userId}`);
			this.auth.set({ isResolved: true, user });
		} else {
			this.auth.set({ isResolved: true, user: null });
		}
	}

	private static auth = writable<{ isResolved: boolean; user: AppUser | null }>({
		isResolved: false,
		user: null
	});
	private static firebaseUtils = new FirebaseUtils();

	public static isResolved = derived(this.auth, (auth) => auth.isResolved);
	public static user = derived(this.auth, (auth) => auth.user);

	public async loginFacebook(): Promise<any> {
		const user = await AuthStore.firebaseUtils.signInWithFacebook();
		const userDbPath = `users/${user.uid}`;
		const exists = await AuthStore.firebaseUtils.exists(userDbPath);
		if (!exists) {
			const userEntry: AppUser = {
				id: user.uid,
				displayName: user.displayName,
				photoUrl: user.photoURL || null
			};
			await AuthStore.firebaseUtils.set([{ path: userDbPath, value: userEntry }]);
		}
		const appUser = await AuthStore.firebaseUtils.readOnce<AppUser>(userDbPath);
		AuthStore.auth.set({ isResolved: true, user: appUser });
	}

	public signOut(): Promise<any> {
		return AuthStore.firebaseUtils.signOut();
	}
}
