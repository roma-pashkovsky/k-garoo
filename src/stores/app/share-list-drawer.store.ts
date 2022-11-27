import { writable } from 'svelte/store';

export const shareListIdStore = writable<{ listId: string | null }>({ listId: null });

export function shareList(listId: string): void {
	shareListIdStore.set({ listId });
}

export function closeShareList(): void {
	shareListIdStore.set({ listId: null });
}
