import type { RequestHandler } from '@sveltejs/kit';
import { UserSearchManager } from '../../../../utils/api/user-search-manager';
import { getQueryParamFromUrl } from '../../../../utils/get-query-param-from-url';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';

export const GET: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return new Response('Invalid auth', { status: 401 });
	}
	try {
		UserSearchManager.init();
		const search = getQueryParamFromUrl('search', request.url);
		if (!search || search.length < 2) {
			return new Response(JSON.stringify([]), {
				statusText: 'Search should be at least 3 chars long'
			});
		}
		return new Response(JSON.stringify(UserSearchManager.search(search)));
	} catch (err) {
		console.error(err);
		return new Response('Internal server error', { status: 500 });
	}
};
