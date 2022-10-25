import type { RequestHandler } from '@sveltejs/kit';
import { UserSearchManager } from '../../../../utils/api/user-search-manager';

export const POST: RequestHandler = (): Response => {
	UserSearchManager.init();
	return new Response('OK');
};
