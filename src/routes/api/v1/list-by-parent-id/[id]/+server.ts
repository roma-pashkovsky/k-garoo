import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../../utils/api/get-user-from-request';
import { invalidAuth, serverError } from '../../../../../utils/api/responses';
import { readOnceAdmin } from '../../../../../utils/api/firebase-admin-utils';
import { listsByMePath } from '../../../../../utils/api/db-paths';

export const GET: RequestHandler = async ({ request, params }): Promise<Response> => {
	const parentListId: string = params.id as string;
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const entryByParent = await readOnceAdmin(
			listsByMePath(user.uid),
			'parentListId',
			1,
			undefined,
			parentListId
		);
		if (entryByParent && Object.keys(entryByParent).length) {
			const listId = Object.keys(entryByParent)[0];
			return json(listId);
		} else {
			return json(null);
		}
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
