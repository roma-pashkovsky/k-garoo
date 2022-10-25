import type { ShareListUser } from '../../types/share-list';

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
			const res = await fetch(`/api/v1/share-list-recent-users/${listId}`, {
				method: 'GET'
			});
			return res.json();
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
}
