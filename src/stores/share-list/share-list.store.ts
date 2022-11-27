import type { ShareListUser } from '../../types/share-list';
import { appFetch } from '../../utils/app-fetch';
import type { AppUser } from '../../types/auth';
import type { ChecklistWithSettings } from '../../types';

export class ShareListStore {
	public async searchUsers(listId: string, search?: string): Promise<ShareListUser[]> {
		try {
			const res = await fetch(`/api/v1/share-list-users/${listId}?search=${search}`, {
				method: 'GET'
			});
			return res.json();
		} catch (err) {
			console.error(err);
			return [];
		}
	}

	public async recentUsers(listId: string): Promise<ShareListUser[]> {
		try {
			const users = await appFetch<ShareListUser[]>(`/share-list-recent-users/${listId}`, {
				method: 'GET'
			});
			return users;
		} catch (err) {
			console.error(err);
			return [];
		}
	}

	public async shareList(listId: string, userId: string): Promise<any> {
		return fetch(`/api/v1/share-list`, {
			method: 'POST',
			body: JSON.stringify({ listId, userId })
		});
	}

	public async unShareList(listId: string, userId: string): Promise<any> {
		return fetch(`/api/v1/share-list`, {
			method: 'DELETE',
			body: JSON.stringify({ listId, userId })
		});
	}

	public registerShareListInviteToken(listId: string, token: string): Promise<void> {
		return appFetch<void>('/share-list-invite-token', {
			method: 'POST',
			body: JSON.stringify({ listId, token })
		});
	}

	public verifyShareListInviteToken(listId: string, token: string, f = fetch): Promise<AppUser> {
		return appFetch<AppUser>(
			`/share-list-invite-token/${token}`,
			{
				method: 'POST',
				body: JSON.stringify({ listId })
			},
			f
		);
	}

	public async applyShareListInviteToken(
		listId: string,
		token: string
	): Promise<ChecklistWithSettings> {
		const list = await appFetch<ChecklistWithSettings>(`/share-list-invite-token/${token}/apply`, {
			method: 'POST',
			body: JSON.stringify({ listId })
		});
		return list;
	}
}
