import { getDB, readOnceAdmin } from './firebase-admin-utils';
import type { AppUser } from '../../types/auth';
import { userPath } from './db-paths';

export class UserSearchManager {
	private static users: AppUser[] = [];
	private static userMap: { [userId: string]: AppUser } = {};

	public static init(): void {
		if (!this.isInit) {
			console.log('initializing user search');
			const db = getDB();
			db.ref('/users').on('value', (snap) => {
				const v = snap.val();
				this.users = Object.values(v);
				this.userMap = v || {};
			});
			this.isInit = true;
		}
	}

	public static async getUser(userId: string): Promise<AppUser | null> {
		if (this.userMap[userId]) {
			return this.userMap[userId];
		}
		try {
			const user = await readOnceAdmin<AppUser>(userPath(userId));
			this.userMap[userId] = user;
			return this.userMap[userId];
		} catch (err) {
			console.log('Error getting user: ', err);
			return null;
		}
	}

	public static async getNonNullUsers(userIds: string[]): Promise<AppUser[]> {
		const proms = userIds.map((id) => this.getUser(id));
		const resp = await Promise.all(proms);
		return resp.filter((u) => !!u) as AppUser[];
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
