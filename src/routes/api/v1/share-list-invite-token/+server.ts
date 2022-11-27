import type { RequestHandler } from '@sveltejs/kit';
import type { CreateShareListInviteTokenRequest } from '../../../../utils/api/client/share-list';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../utils/api/responses';
import { getTimestamp, setAdmin } from '../../../../utils/api/firebase-admin-utils';
import { shareListInviteTokenPath } from '../../../../utils/api/db-paths';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}

	try {
		const requestData: CreateShareListInviteTokenRequest = await request.json();
		await setAdmin([
			{
				path: shareListInviteTokenPath(requestData.token),
				value: {
					listId: requestData.listId,
					userId: user.uid,
					created_utc: getTimestamp()
				}
			}
		]);
		return ok();
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
