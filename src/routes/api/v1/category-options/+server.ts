import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../utils/api/responses';
import { readOnceAdmin, setAdmin } from '../../../../utils/api/firebase-admin-utils';
import {
	categoryOptionsByUserByOptionPath,
	categoryOptionsByUserPath
} from '../../../../utils/api/db-paths';
import { json } from '@sveltejs/kit';
import type { CategoryOption } from '../../../../types';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const option: CategoryOption = await request.json();
		await setAdmin([
			{ path: categoryOptionsByUserByOptionPath(user.uid, option.id), value: option }
		]);
		return ok();
	} catch (err) {
		console.log(err);
		return serverError();
	}
};

export const GET: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const options = await readOnceAdmin(categoryOptionsByUserPath(user.uid));
		if (options) {
			return json(Object.values(options));
		} else {
			return json([]);
		}
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
