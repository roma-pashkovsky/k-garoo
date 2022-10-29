import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../utils/api/responses';
import type { FirebaseSetItem } from '../../../../types/firebase-utils';
import { setAdmin } from '../../../../utils/api/firebase-admin-utils';
import {
	categoryOptionsByUserPath,
	listsByMePath,
	recentUsersPath,
	stopListByMePath,
	userPath
} from '../../../../utils/api/db-paths';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const updates: FirebaseSetItem[] = [
			{
				path: listsByMePath(user.uid),
				value: null
			},
			{
				path: userPath(user.uid),
				value: null
			},
			{
				path: categoryOptionsByUserPath(user.uid),
				value: null
			},
			{
				path: stopListByMePath(user.uid),
				value: null
			},
			{
				path: recentUsersPath(user.uid),
				value: null
			}
		];
		await setAdmin(updates);
		return ok();
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
