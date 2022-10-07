import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import type { User } from 'firebase/auth';
import { FacebookAuthProvider, getAuth, signInWithPopup, signOut } from 'firebase/auth';
import { getDatabase, onValue, orderByChild, query, ref, update } from 'firebase/database';
import { variables } from './variables';
import type { FirebaseSetItem } from '../types/firebase-utils';
import { getRandomElementId } from './get-random-element-id';
import { get } from 'svelte/store';
import { t } from '../stores/app/translate';

export class FirebaseUtils {
	private static isInitialized = false;

	private static app: FirebaseApp;

	private static initializeApp(): void {
		if (!this.isInitialized) {
			try {
				this.app = initializeApp({
					appId: variables.FIREBASE_APP_ID,
					apiKey: variables.FIREBASE_API_KEY,
					authDomain: variables.FIREBASE_AUTH_DOMAIN,
					databaseURL: variables.FIREBASE_DATABASE_URL,
					projectId: variables.FIREBASE_PROJECT_ID,
					storageBucket: variables.FIREBASE_STORAGE_BUCKET,
					messagingSenderId: variables.FIREBASE_MESSAGING_SENDER_ID
				});
				this.setOnAuthStateChanged();
				this.isInitialized = true;
			} catch (err) {
				console.error(err);
			}
		}
	}

	private static onAuthStateChangedListeners: { [id: string]: (user: User | null) => void } = {};
	public static lastUserValue: User | null;

	private static setOnAuthStateChanged(): void {
		const auth = getAuth();
		auth.onAuthStateChanged((user) => {
			this.lastUserValue = user;
			Object.keys(this.onAuthStateChangedListeners).forEach((key) => {
				this.onAuthStateChangedListeners[key](user);
			});
		});
	}

	constructor() {
		FirebaseUtils.initializeApp();
	}

	/**
	 * Initially the user is undefined - it means the db has not been connected yet.
	 * Then user becomes either null (not logged in) or User (logged in).
	 * @param cb is called immediately with the current user value
	 * @return unsubscribe id
	 */
	public subscribeOnAuthChanged(cb: (user: User | null | undefined) => void): string {
		cb(FirebaseUtils.lastUserValue);
		const id = getRandomElementId(6);
		FirebaseUtils.onAuthStateChangedListeners[id] = cb;
		return id;
	}

	public unsubscribeOnAuthChanged(id: string): void {
		delete FirebaseUtils.onAuthStateChangedListeners[id];
	}

	public resolveAuth(): Promise<string | null> {
		return new Promise((resolve, reject) => {
			const auth = getAuth();
			const off = auth.onAuthStateChanged(
				(user) => {
					off();
					if (user) {
						resolve(user.uid);
					} else {
						resolve(null);
					}
				},
				(error) => reject(error)
			);
		});
	}

	public readOnce<T>(path: string, orderByChildPath?: string): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			const db = getDatabase();
			const readRef = ref(db, path);
			let readQuery;
			if (orderByChildPath) {
				readQuery = query(readRef, orderByChild(orderByChildPath));
			}
			onValue(
				readQuery || readRef,
				(snapshot) => {
					resolve(snapshot.val());
				},
				(error) => {
					reject(error);
				},
				{ onlyOnce: true }
			);
		});
	}

	public exists(path: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			const db = getDatabase();
			const readRef = ref(db, path);
			onValue(
				readRef,
				(snapshot) => {
					resolve(snapshot.exists());
				},
				(error) => {
					reject(error);
				},
				{ onlyOnce: true }
			);
		});
	}

	public set(items: FirebaseSetItem[]): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const db = getDatabase();
			const updates = items.reduce((p, c) => {
				return { ...p, [c.path]: c.value };
			}, {});
			update(ref(db), updates)
				.then(() => resolve())
				.catch((err) => reject(err));
		});
	}

	public signInWithFacebook(): Promise<User> {
		const auth = getAuth();
		const provider = new FacebookAuthProvider();

		return signInWithPopup(auth, provider).then((cred) => cred.user);
	}

	public signOut(): Promise<void> {
		const auth = getAuth();
		return signOut(auth);
	}

	public async removeUser(): Promise<void> {
		const auth = getAuth();
		if (auth.currentUser) {
			try {
				await auth.currentUser.delete();
			} catch (err) {
				console.log(err);
				const msg = get(t)('settings.data.failed-to-remove-account-prompt');
				alert(msg);
			}
		}
	}
}
