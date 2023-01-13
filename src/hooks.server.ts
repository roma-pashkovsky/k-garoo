import type { Handle } from '@sveltejs/kit/types/internal';
import { UserSearchManager } from './utils/api/user-search-manager';

UserSearchManager.init();
export const isServerAPILogs = false;

export const handle: Handle = async ({ event, resolve }) => {
	const path = event?.url?.pathname;
	const method = event?.request?.method;
	const date = new Date().toISOString();
	isServerAPILogs && console.log(`[${date}] ${method} ${path} requested`);
	isServerAPILogs && console.time(`[${date}] ${method} ${path}`);
	try {
		const response = await resolve(event);
		isServerAPILogs && console.timeEnd(`[${date}] ${method} ${path}`);
		return response;
	} catch (err) {
		isServerAPILogs && console.log('Response error:', err);
		isServerAPILogs && console.timeEnd(`[${date}] ${method} ${path}`);
		return new Response('Server error', { status: 500 });
	}
};
