import { FirebaseUtils } from '../../utils/firebase-utils';
import { derived, writable } from 'svelte/store';
import { SyncStore } from './sync.store';
import { auth } from './auth';
import { cleanLocalDataOnLogout } from '../../utils/local-storage-state';

export class AuthStore {
	public static isLoginModalOpen = writable<boolean>(false);
	private static firebaseUtils = new FirebaseUtils();

	public static isResolved = derived(auth, (auth) => auth.isResolved);
	public static user = derived(auth, (auth) => auth.user);
	public static isLoggedIn = derived(this.user, (user) => !!user);

	public static loginClickEvents = writable<number | null>(null);

	public static triggerLoginClicked(): void {
		this.loginClickEvents.set(new Date().getTime());
	}

	public async loginFacebook(sync: boolean): Promise<any> {
		const user = await AuthStore.firebaseUtils.signInWithFacebook();
		auth.set({ isResolved: true, user });
		if (sync) {
			await new SyncStore().syncLocalDataToDb();
		}
	}

	public async signOut(): Promise<any> {
		await AuthStore.firebaseUtils.signOut();
		auth.set({ isResolved: true, user: null });
		cleanLocalDataOnLogout();
		location.reload();
	}
}
