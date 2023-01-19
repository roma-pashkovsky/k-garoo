import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import type {
	CreateListRequest,
	UpdateListRequest
} from '../../../../../utils/api/client/create-update-list';
import { badRequest, invalidAuth, ok, serverError } from '../../../../../utils/api/responses';
import { existsAdmin } from '../../../../../utils/api/firebase-admin-utils';
import { listByMePath, listPath } from '../../../../../utils/api/db-paths';
import { getUserFromRequest } from '../../../../../utils/api/get-user-from-request';
import { getChecklistByUserThroughCache } from '../../../../../utils/api/get-checklist-by-user-through-cache';
import { cleanUserChecklistsCache } from '../../../../../utils/api/get-user-checklists-through-cache';
import { createListApi } from '../../../../../utils/api/create-list-api';
import { updateListApi } from '../../../../../utils/api/update-list-api';
import { deleteListApi } from '../../../../../utils/api/delete-list-api';

export const POST: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId: string = params.listId as string;
	const list: CreateListRequest = await request.json();
	if (!list?.items?.length) {
		return badRequest('List should have at least one item');
	}
	if (!list.id || list.id !== listId) {
		return badRequest('Incorrect list id');
	}
	try {
		const exists = await existsAdmin(listPath(listId));
		if (exists) {
			return badRequest('List already exists');
		} else {
			await createListApi(user.uid, list);
			const result = await getChecklistByUserThroughCache(listId, user.uid);
			return json(result);
		}
	} catch (err) {
		console.log(err);
		return serverError();
	}
};

export const PUT: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId: string = params.listId as string;
	try {
		const isMyList = await existsAdmin(listByMePath(user.uid, listId));
		if (!isMyList) {
			return new Response(JSON.stringify({ error: 'Not your list' }), { status: 401 });
		}
		const editRequest: UpdateListRequest = await request.json();
		await updateListApi(user.uid, listId, editRequest);
		const result = await getChecklistByUserThroughCache(listId, user.uid);
		return json(result);
	} catch (err) {
		console.log(err);
		return serverError();
	}
};

export const GET: RequestHandler = async ({ request, params }): Promise<Response> => {
	const listId: string = params.listId as string;
	const user = await getUserFromRequest(request);
	try {
		const result = await getChecklistByUserThroughCache(listId, user?.uid);
		return json(result);
	} catch (err) {
		console.log(err);
		return serverError();
	}
};

export const DELETE: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId: string = params.listId as string;
	try {
		await deleteListApi(user.uid, listId);
		await cleanUserChecklistsCache(user.uid);
		return ok();
	} catch (err) {
		return serverError();
	}
};
