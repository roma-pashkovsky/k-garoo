import { writable } from 'svelte/store';

export class AppReloader {
	public static isReloading = writable<boolean>(false);

	public reload(): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => {
				AppReloader.isReloading.set(true);
				setTimeout(() => {
					AppReloader.isReloading.set(false);
					resolve();
				}, 300);
			});
		});
	}
}
