import type { FirebaseApp } from 'firebase/app';
import type { User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import {
	FacebookAuthProvider,
	getAuth,
	signInWithPopup,
	signInWithRedirect,
	signOut
} from 'firebase/auth';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { variables } from './variables';
import type { FirebaseSetItem } from '../types/firebase-utils';

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
				this.isInitialized = true;
			} catch (err) {
				console.error(err);
			}
		}
	}

	constructor() {
		FirebaseUtils.initializeApp();
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

	public readOnce<T>(path: string): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			const db = getDatabase();
			const readRef = ref(db, path);
			onValue(
				readRef,
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
}
