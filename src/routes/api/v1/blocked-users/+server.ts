import type { RequestHandler } from '@sveltejs/kit';
import type { BlockUserRequest } from '../../../../utils/api/client/blocked-users';
import type { StopListByMe } from '../../../../types/fb-database';
import type { AppUser } from '../../../../types/auth';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../utils/api/responses';
import { getTimestamp, readOnceAdmin, setAdmin } from '../../../../utils/api/firebase-admin-utils';
import {
	stopListAgainstMeByUserPath,
	stopListByMeByUserPath,
	stopListByMePath,
	userPath
} from '../../../../utils/api/db-paths';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const r: BlockUserRequest = await request.json();
		if (r.userId) {
			await setAdmin([
				{
					path: stopListByMeByUserPath(user.uid, r.userId),
					value: { updated_utc: getTimestamp() }
				},
				{ path: stopListAgainstMeByUserPath(r.userId, user.uid), value: user.uid }
			]);
		}
		return ok();
	} catch (e) {
		console.log(e);
		return serverError();
	}
};

export const GET: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const blockedObj = await readOnceAdmin<StopListByMe>(stopListByMePath(user.uid));
		if (!blockedObj) {
			return json([]);
		}
		const userIds = Object.keys(blockedObj);
		userIds.sort((a, b) => blockedObj[b].updated_utc - blockedObj[a].updated_utc);
		const proms = userIds.map((uid) => readOnceAdmin<AppUser>(userPath(uid)));
		const users = await Promise.all(proms);
		return json(users);
	} catch (e) {
		console.log(e);
		return serverError();
	}
};
