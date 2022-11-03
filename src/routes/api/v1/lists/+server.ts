import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, serverError } from '../../../../utils/api/responses';
import { readOnceAdmin } from '../../../../utils/api/firebase-admin-utils';
import { listsByMePath } from '../../../../utils/api/db-paths';
import type { ListsByUser } from '../../../../types/fb-database';
import { json } from '@sveltejs/kit';
import { redisGet } from '../../../../utils/api/redis';
import type { DbChecklist } from '../../../../types/db-checklist';

export const GET: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const listByUser = await readOnceAdmin<ListsByUser>(listsByMePath(user.uid));
		if (listByUser) {
			for (const listId in listByUser) {
				const cachedList = await redisGet<DbChecklist>(listId);
				if (cachedList) {
					(listByUser[listId] as any)['name'] = cachedList.name;
				}
			}
		}
		return json(listByUser);
	} catch (err) {
		return serverError();
	}
};
