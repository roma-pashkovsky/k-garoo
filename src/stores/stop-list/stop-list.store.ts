import { writable } from 'svelte/store';
import type { AppUser } from '../../types/auth';

export const stopListUsers = writable<AppUser[]>([]);

export const loadStopListUsers = async (f = fetch): Promise<void> => {
	const res = await f('/api/v1/blocked-users', { method: 'GET' });
	const users = await res.json();
	stopListUsers.set(users);
};

export const unblockUser = async (userId: string): Promise<void> => {
	await fetch(`/api/v1/blocked-users/${userId}`, { method: 'DELETE' });
	await loadStopListUsers();
};
