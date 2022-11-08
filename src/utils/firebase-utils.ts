import { initializeApp } from 'firebase/app';
import {
	type AuthCredential,
	FacebookAuthProvider,
	fetchSignInMethodsForEmail,
	getAuth,
	GoogleAuthProvider,
	linkWithCredential,
	type OAuthProvider,
	signInWithPopup,
	signOut,
	type User,
	type UserCredential
} from 'firebase/auth';
import { variables } from './variables';
import { get } from 'svelte/store';
import { t } from '../stores/app/translate';
import type { AppUser } from '../types/auth';
import { setUserLocalStorage } from './local-storage-state';

export class WrongProviderError extends Error {
	constructor(public email: string, public cred: AuthCredential) {
		super();
	}
}

export type WrongProviderTokenResponse = {
	oauthAccessToken: string;
	targetProviderId: string;
};

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

	public async signInWithFacebook(): Promise<AppUser | null> {
		const auth = getAuth();
		const provider = new FacebookAuthProvider();
		try {
			const cred: UserCredential = await signInWithPopup(auth, provider);
			const token = await cred.user.getIdToken();
			const user: AppUser = {
				id: cred.user.uid,
				displayName: cred.user.displayName,
				photoUrl: cred.user.photoURL
			};
			await this.createSession(token, user);
			return user;
		} catch (err) {
			if ((err as any).code === 'auth/account-exists-with-different-credential') {
				throw new WrongProviderError(
					(err as any).customData.email,
					FacebookAuthProvider.credentialFromError(err as any) as AuthCredential
				);
			}
			console.log(err);
			return null;
		}
	}

	public async signInGoogle(): Promise<AppUser | null> {
		const auth = getAuth();
		const provider = new GoogleAuthProvider();
		try {
			const cred = await signInWithPopup(auth, provider);
			const token = await cred.user.getIdToken();
			const user: AppUser = {
				id: cred.user.uid,
				displayName: cred.user.displayName,
				photoUrl: cred.user.photoURL
			};
			await this.createSession(token, user);
			return user;
		} catch (err) {
			if ((err as any).code === 'auth/account-exists-with-different-credential') {
				throw new WrongProviderError(
					(err as any).customData.email,
					GoogleAuthProvider.credentialFromError(err as any) as AuthCredential
				);
			}
			return null;
		}
	}

	public async handleExistingCredentialsError(
		email: string,
		pendingCred: AuthCredential
	): Promise<AppUser | null> {
		const methods = await fetchSignInMethodsForEmail(getAuth(), email);
		const preferredMethod = methods[0];
		const provider = this.getProviderForProviderId(preferredMethod);
		provider.setCustomParameters({ login_hint: email });
		const cred = await signInWithPopup(getAuth(), provider);
		const finalCred = await linkWithCredential(cred.user, pendingCred);
		const token = await finalCred.user.getIdToken();
		const appUser = {
			id: cred.user.uid,
			displayName: cred.user.displayName,
			photoUrl: cred.user.photoURL
		};
		await this.createSession(token, appUser);
		return appUser;
	}

	private getProviderForProviderId(id: string): OAuthProvider {
		switch (id) {
			case GoogleAuthProvider.PROVIDER_ID:
				return new GoogleAuthProvider() as OAuthProvider;
			case FacebookAuthProvider.PROVIDER_ID:
				return new FacebookAuthProvider() as OAuthProvider;
			default:
				throw new Error('Unknown provider: ' + id);
		}
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
		await setUserLocalStorage(user);
	}

	private async deleteSession(): Promise<void> {
		await fetch('/api/v1/session', {
			method: 'DELETE'
		});
	}
}
