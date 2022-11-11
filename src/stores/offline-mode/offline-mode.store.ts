import { writable } from 'svelte/store';

export const offline = writable<boolean>(false);

let handle: any;

export const startOfflineListener = (): void => {
	if (navigator) {
		offline.set(!navigator.onLine);
	}
	addEventListener('online', () => {
		if (handle) {
			clearInterval(handle);
			handle = undefined;
		}
		handle = setInterval(() => {
			checkConnectionPing(2500)
				.then(() => {
					clearInterval(handle);
					handle = undefined;
					console.log(':online');
					offline.set(false);
				})
				.catch((err) => {
					// still offline
				});
		}, 3000);
	});

	addEventListener('offline', () => {
		console.log(':offline');
		offline.set(true);
		if (handle) {
			clearInterval(handle);
			handle = undefined;
		}
	});
};

function checkConnectionPing(timeout: number): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		let controller: AbortController | undefined = undefined;
		if (AbortController) {
			controller = new AbortController();
			setTimeout(() => {
				(controller as AbortController).abort();
				reject('timeout');
			}, timeout);
		}

		fetch(
			'/img/ping.png',
			controller ? { cache: 'no-store', signal: controller.signal } : { cache: 'no-store' }
		)
			.then(() => {
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
	});
}
