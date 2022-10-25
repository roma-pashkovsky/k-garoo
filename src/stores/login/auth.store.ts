import { FirebaseUtils } from '../../utils/firebase-utils';
import { derived, writable } from 'svelte/store';
import { SyncStore } from './sync.store';
import { auth } from './auth';

export class AuthStore {
	public static isLoginModalOpen = writable<boolean>(false);
	private static firebaseUtils = new FirebaseUtils();

	public static isResolved = derived(auth, (auth) => auth.isResolved);
	public static user = derived(auth, (auth) => auth.user);
	public static isLoggedIn = derived(this.user, (user) => !!user);

	public async loginFacebook(): Promise<any> {
		const user = await AuthStore.firebaseUtils.signInWithFacebook();
		auth.set({ isResolved: true, user });
		await new SyncStore().syncLocalDataToDb();
	}

	public async signOut(): Promise<any> {
		await AuthStore.firebaseUtils.signOut();
		auth.set({ isResolved: true, user: null });
	}
}
