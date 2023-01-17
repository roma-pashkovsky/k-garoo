import type { RequestHandler } from '@sveltejs/kit';
import type { UpdateChecklistSettingsRequest } from '../../../../../../utils/api/client/checklist-settings';
import { getUserFromRequest } from '../../../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../../../utils/api/responses';
import type { FirebaseSetItem } from '../../../../../../types/firebase-utils';
import {
	listPropertyPath,
	listSettingsByMeByListPath,
	listSettingsByMeByListPropertyPath
} from '../../../../../../utils/api/db-paths';
import type { ChecklistSettings } from '../../../../../../types';
import { readOnceAdmin, setAdmin } from '../../../../../../utils/api/firebase-admin-utils';
import { json } from '@sveltejs/kit';
import { updateListSettingsApi } from '../../../../../../utils/api/update-list-settings-api';

export const GET: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const listId: string = params.listId as string;
		const settings = await readOnceAdmin(listSettingsByMeByListPath(user.uid, listId));
		return json(settings);
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
	try {
		const listId: string = params.listId as string;
		const editRequest: UpdateChecklistSettingsRequest = await request.json();
		await updateListSettingsApi(user.uid, listId, editRequest);
		return ok();
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
