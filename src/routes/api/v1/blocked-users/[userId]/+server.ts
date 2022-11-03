import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../../utils/api/responses';
import { setAdmin } from '../../../../../utils/api/firebase-admin-utils';
import {
	stopListAgainstMeByUserPath,
	stopListByMeByUserPath
} from '../../../../../utils/api/db-paths';

export const DELETE: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const userId: string = params.userId as string;
		await setAdmin([
			{ path: stopListByMeByUserPath(user.uid, userId), value: null },
			{ path: stopListAgainstMeByUserPath(userId, user.uid), value: null }
		]);
		return ok();
	} catch (e) {
		console.log(e);
		return serverError();
	}
};
