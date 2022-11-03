import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import type { CheckList } from '../../../../../types';
import type { ListsSharedWithMe } from '../../../../../types/fb-database';
import type { AppUser } from '../../../../../types/auth';
import { getUserFromRequest } from '../../../../../utils/api/get-user-from-request';
import { invalidAuth, serverError } from '../../../../../utils/api/responses';
import { readOnceAdmin } from '../../../../../utils/api/firebase-admin-utils';
import { listPath, listSharedWithMePath, userPath } from '../../../../../utils/api/db-paths';

export const GET: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId: string = params.listId as string;
	try {
		const list = await readOnceAdmin<CheckList>(listPath(listId));
		const items = Object.values(list.items);
		items.sort((a, b) => a.orderAdded - b.orderAdded);
		const sharedBy = await readOnceAdmin<ListsSharedWithMe[string]>(
			listSharedWithMePath(user.uid, listId)
		);
		const sharedByUser = await readOnceAdmin<AppUser>(userPath(sharedBy.sharedById));
		return json({ ...list, items, sharedBy: sharedByUser });
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
