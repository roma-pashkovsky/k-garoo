import { writable } from 'svelte/store';

export const shareListIdStore = writable<string | null>(null);

export function shareList(listId: string): void {
	shareListIdStore.set(listId);
}

export function closeShareList(): void {
	shareListIdStore.set(null);
}
