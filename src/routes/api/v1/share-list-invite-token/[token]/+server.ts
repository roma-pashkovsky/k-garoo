import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { UserSearchManager } from '../../../../../utils/api/user-search-manager';
import { badRequest, serverError } from '../../../../../utils/api/responses';
import { readOnceAdmin } from '../../../../../utils/api/firebase-admin-utils';
import { shareListInviteTokenPath } from '../../../../../utils/api/db-paths';
import type { ShareListInviteTokenData } from '../../../../../types/fb-database';

export const POST: RequestHandler = async ({ request, params }): Promise<Response> => {
	try {
		const token: string = params.token as string;
		const requestData = await request.json();
		const listId = requestData.listId;
		const tokenEntry = await readOnceAdmin<ShareListInviteTokenData>(
			shareListInviteTokenPath(token)
		);
		if (tokenEntry) {
			if (tokenEntry.listId === listId) {
				const userDb = await UserSearchManager.getUser(tokenEntry.userId);
				return json(userDb);
			}
			console.log('token list id is different from request list id');
		}
		return badRequest('Invalid token');
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
