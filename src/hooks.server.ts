import type { Handle } from '@sveltejs/kit/types/internal';
import { UserSearchManager } from './utils/api/user-search-manager';

UserSearchManager.init();

export const handle: Handle = async ({ event, resolve }) => {
	const path = event?.url?.pathname;
	const method = event?.request?.method;
	const date = new Date().toISOString();

	console.log(`[${date}] ${method} ${path} requested`);
	console.time(`[${date}] ${method} ${path}`);
	try {
		const response = await resolve(event);
		console.timeEnd(`[${date}] ${method} ${path}`);
		return response;
	} catch (err) {
		console.log('Response error:', err);
		console.timeEnd(`[${date}] ${method} ${path}`);
		return new Response('Server error', { status: 500 });
	}
};
