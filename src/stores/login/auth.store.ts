import { FirebaseUtils } from '../../utils/firebase-utils';
import type { AppUser } from '../../types/auth';
import { writable } from 'svelte/store';

export class AuthStore {
	public static user = writable<AppUser | null>(null);
	private static firebaseUtils = new FirebaseUtils();

	public loginFacebook(): Promise<any> {
		return AuthStore.firebaseUtils.signInWithFacebook();
	}
}
