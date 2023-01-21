import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../../utils/api/get-user-from-request';
import { invalidAuth, serverError } from '../../../../../utils/api/responses';
import { readOnceAdmin } from '../../../../../utils/api/firebase-admin-utils';
import { listsByMePath } from '../../../../../utils/api/db-paths';
import { getChildListIdForList } from '../../../../../utils/api/get-child-list-id-for-list';

export const GET: RequestHandler = async ({ request, params }): Promise<Response> => {
	const parentListId: string = params.id as string;
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const childListId = await getChildListIdForList(user.uid, parentListId);
		return json(childListId);
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
