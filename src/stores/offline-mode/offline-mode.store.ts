import { writable } from 'svelte/store';

export const offline = writable<boolean>(false);

export const startOfflineListener = (): void => {
	addEventListener('online', () => {
		console.log(':online');
		offline.set(false);
	});

	addEventListener('offline', () => {
		console.log(':offline');
		offline.set(true);
	});
};
