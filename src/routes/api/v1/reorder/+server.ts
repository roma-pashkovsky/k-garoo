import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../utils/api/responses';
import { reorderListApi } from '../../../../utils/api/reorder-list-api';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const listIds: string[] = (await request.json()) as string[];
		await reorderListApi(user.uid, listIds);
		return ok();
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
