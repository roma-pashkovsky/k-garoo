import { getApp, getApps, cert, initializeApp } from 'firebase-admin/app';
import type { AppOptions } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getDatabase, ServerValue } from 'firebase-admin/database';
import type { Database } from 'firebase-admin/database';
import type { FirebaseSetItem } from '../../types/firebase-utils';

/**
 * !Never import this to client-side code!
 */
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const clientEmail = import.meta.env.VITE_FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = import.meta.env.VITE_FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;
const adminConfig: AppOptions = {
	credential: cert({
		projectId,
		clientEmail,
		privateKey
	}),
	databaseURL
};

const getAdminApp = () => (getApps().length ? getApp() : initializeApp(adminConfig));

export const verifyIdToken = (token: string) => {
	const auth = getAuth(getAdminApp());
	return auth.verifyIdToken(token);
};

export const createSessionCookie = async (idToken: string, maxAgeSec: number): Promise<string> => {
	const auth = getAuth(getAdminApp());
	const cookie = await auth.createSessionCookie(idToken, { expiresIn: maxAgeSec * 1000 });
	return `session=${cookie}; SameSite=Strict; Path=/; Secure; HttpOnly; Max-Age=${maxAgeSec}`;
};

export const verifySessionCookie = (sessionCookie: string): Promise<DecodedIdToken> => {
	const auth = getAuth(getAdminApp());
	return auth.verifySessionCookie(sessionCookie);
};

export const getDB = (): Database => {
	return getDatabase(getAdminApp());
};

export function readOnceAdmin<T>(
	path: string,
	orderByChildPath?: string,
	limitFirst?: number,
	limitLast?: number,
	equalTo?: string | number
): Promise<T> {
	const db = getDB();
	return new Promise<T>((resolve, reject) => {
		const readRef = db.ref(path);
		let readQuery;
		if (orderByChildPath) {
			readQuery = readRef.orderByChild(orderByChildPath);
			if (equalTo) {
				readQuery = readQuery.equalTo(equalTo);
			}
		}
		if (limitFirst) {
			readQuery = (readQuery || readRef).limitToFirst(limitFirst);
		} else if (limitLast) {
			readQuery = (readQuery || readRef).limitToLast(limitLast);
		}
		const t = readQuery || readRef;
		t.on(
			'value',
			(snap) => {
				resolve(snap.val());
				t.off('value');
			},
			(err) => {
				reject(err);
			}
		);
	});
}

export function existsAdmin(path: string): Promise<boolean> {
	const db = getDB();
	return new Promise<boolean>((resolve, reject) => {
		const readRef = db.ref(path);
		readRef.on(
			'value',
			(snap) => {
				resolve(snap.exists());
				readRef.off('value');
			},
			(err) => {
				reject(err);
			}
		);
	});
}

export function setAdmin(items: FirebaseSetItem[]): Promise<void> {
	const db = getDB();
	return new Promise((resolve, reject) => {
		const update = items.reduce((p, c) => {
			return { ...p, [c.path]: c.value };
		}, {});
		db.ref().update(update, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

export const getTimestamp = () => ServerValue.TIMESTAMP;
