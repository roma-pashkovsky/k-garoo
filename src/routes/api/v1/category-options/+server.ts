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
import { createCategoryOptionApi } from '../../../../utils/api/create-category-option-api';
import { deleteCategoryOptionApi } from '../../../../utils/api/delete-category-option-api';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const option: CategoryOption = await request.json();
		await createCategoryOptionApi(user.uid, option);
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

export const DELETE: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const optionId = await request.json().then((res) => res.optionId);
		await deleteCategoryOptionApi(user.uid, optionId);
		return ok();
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
