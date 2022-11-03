import { initializeApp } from 'firebase/app';
import type { User, UserCredential } from 'firebase/auth';
import { FacebookAuthProvider, getAuth, signInWithPopup, signOut } from 'firebase/auth';
import { variables } from './variables';
import { get } from 'svelte/store';
import { t } from '../stores/app/translate';
import type { AppUser } from '../types/auth';

export class FirebaseUtils {
	private static isInitialized = false;

	private static initializeApp(): void {
		if (!this.isInitialized) {
			try {
				initializeApp({
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
		auth.onAuthStateChanged(async (user) => {
			const finalUser = user;
			this.lastUserValue = finalUser;
			Object.keys(this.onAuthStateChangedListeners).forEach((key) => {
				this.onAuthStateChangedListeners[key](finalUser);
			});
		});
	}

	constructor() {
		FirebaseUtils.initializeApp();
	}

	public async signInWithFacebook(): Promise<AppUser> {
		const auth = getAuth();
		const provider = new FacebookAuthProvider();
		const cred: UserCredential = await signInWithPopup(auth, provider);
		const token = await cred.user.getIdToken();
		const user: AppUser = {
			id: cred.user.uid,
			displayName: cred.user.displayName,
			photoUrl: cred.user.photoURL
		};
		await this.createSession(token, user);
		return user;
	}

	public async signOut(): Promise<void> {
		const auth = getAuth();
		await signOut(auth);
		await this.deleteSession();
	}

	public async removeUser(): Promise<void> {
		const auth = getAuth();
		if (auth.currentUser) {
			try {
				await auth.currentUser.delete();
				await this.deleteSession();
			} catch (err) {
				console.log(err);
				const msg = get(t)('settings.data.failed-to-remove-account-prompt');
				alert(msg);
			}
		}
	}

	private async createSession(idToken: string, user: AppUser): Promise<void> {
		await fetch('/api/v1/session', {
			method: 'POST',
			headers: new Headers({
				Authorization: `Bearer ${idToken}`
			}),
			body: JSON.stringify(user)
		});
	}

	private async deleteSession(): Promise<void> {
		await fetch('/api/v1/session', {
			method: 'DELETE'
		});
	}
}
