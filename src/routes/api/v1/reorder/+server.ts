import type { RequestHandler } from '@sveltejs/kit';
import type { FirebaseSetItem } from '../../../../types/firebase-utils';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../utils/api/responses';
import { setAdmin } from '../../../../utils/api/firebase-admin-utils';
import { listByMePath } from '../../../../utils/api/db-paths';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const listIds: string[] = (await request.json()) as string[];
		const l = listIds.length - 1;
		const updates = listIds.map((listId, ind) => {
			return {
				path: `${listByMePath(user.uid, listId)}/order`,
				value: (l - ind) * 1000
			} as FirebaseSetItem;
		});
		await setAdmin(updates);
		return ok();
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
