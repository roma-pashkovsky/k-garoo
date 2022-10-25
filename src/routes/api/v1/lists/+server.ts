import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, serverError } from '../../../../utils/api/responses';
import { readOnceAdmin } from '../../../../utils/api/firebase-admin-utils';
import { listsByMePath } from '../../../../utils/api/db-paths';
import type { ListsByUser } from '../../../../types/fb-database';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const listByUser = await readOnceAdmin<ListsByUser>(listsByMePath(user.uid));
		return json(listByUser);
	} catch (err) {
		return serverError();
	}
};
