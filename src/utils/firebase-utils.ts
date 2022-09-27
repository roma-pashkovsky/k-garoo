import { initializeApp } from 'firebase/app';
import { signOut, getAuth, signInWithPopup, FacebookAuthProvider } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import { variables } from './variables';

export class FirebaseUtils {
	private static isInitialized = false;

	private static app: FirebaseApp;

	private static initializeApp(): void {
		if (!this.isInitialized) {
			this.app = initializeApp({
				appId: variables.FIREBASE_APP_ID,
				apiKey: variables.FIREBASE_API_KEY,
				authDomain: variables.FIREBASE_AUTH_DOMAIN,
				projectId: variables.FIREBASE_PROJECT_ID,
				storageBucket: variables.FIREBASE_STORAGE_BUCKET,
				messagingSenderId: variables.FIREBASE_MESSAGING_SENDER_ID
			});
			this.isInitialized = true;
		}
	}

	constructor() {
		FirebaseUtils.initializeApp();
	}

	public signInWithFacebook(): Promise<any> {
		const auth = getAuth();
		const provider = new FacebookAuthProvider();

		return signInWithPopup(auth, provider).then((result) => {
			console.log(result);
		});
	}
}
