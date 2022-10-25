import { getDB } from './firebase-admin-utils';
import type { AppUser } from '../../types/auth';

export class UserSearchManager {
	private static users: AppUser[] = [];

	public static init(): void {
		if (!this.isInit) {
			const db = getDB();
			db.ref('/users').on('value', (snap) => {
				this.users = Object.values(snap.val());
			});
			this.isInit = true;
		}
	}

	public static search(query: string): AppUser[] {
		const prepared = query.toLowerCase();
		return this.users
			.filter((u) => !!u.displayName)
			.filter((u) => {
				return (u.displayName as string).toLowerCase().includes(prepared);
			});
	}

	private static isInit = false;
}
