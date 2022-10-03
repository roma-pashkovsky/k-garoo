import { FirebaseUtils } from '../../utils/firebase-utils';
import type { AppUser } from '../../types/auth';
import { derived, writable } from 'svelte/store';
import { SyncStore } from './sync.store';

export class AuthStore {
	public static isLoginModalOpen = writable<boolean>(false);
	public static isSyncingData = writable<boolean>(false);
	private static auth = writable<{ isResolved: boolean; user: AppUser | null }>({
		isResolved: false,
		user: null
	});
	private static firebaseUtils = new FirebaseUtils();
	private static isInitialized = false;
	private static shouldSync = false;
	private static syncStore = new SyncStore();
	public static async init(): Promise<void> {
		if (!this.isInitialized) {
			this.firebaseUtils.subscribeOnAuthChanged(async function (user) {
				if (!user) {
					AuthStore.auth.set({ isResolved: true, user: null });
				} else {
					const userId = user.uid;
					const userDbPath = `users/${userId}`;
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
					if (AuthStore.shouldSync) {
						AuthStore.shouldSync = false;
						AuthStore.isSyncingData.set(true);
						console.log('sync start');
						await AuthStore.syncStore.syncLocalDataToDb();
						console.log('sync complete');
						AuthStore.isSyncingData.set(false);
					}
				}
			});
			this.isInitialized = true;
		}
	}

	public static isResolved = derived(this.auth, (auth) => auth.isResolved);
	public static user = derived(this.auth, (auth) => auth.user);

	public async loginFacebook(): Promise<any> {
		await AuthStore.firebaseUtils.signInWithFacebook();
		AuthStore.shouldSync = true;
	}

	public signOut(): Promise<any> {
		return AuthStore.firebaseUtils.signOut();
	}
}
