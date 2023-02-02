import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, serverError } from '../../../../utils/api/responses';
import type {
	CreateCategoryOptionSyncTask,
	CreateListSyncTask,
	DeleteCategoryOptionSyncTask,
	DeleteListSyncTask,
	ReorderListSyncTask,
	SyncTask,
	UpdateListSettingsSyncTask,
	UpdateListSyncTask
} from '../../../../utils/api/client/sync-task-types';
import { getUID } from '../../../../utils/get-uid';
import { SyncTaskTypes } from '../../../../utils/api/client/sync-task-types';
import { json } from '@sveltejs/kit';
import { updateListApi } from '../../../../utils/api/update-list-api';
import { createListApi } from '../../../../utils/api/create-list-api';
import { deleteListApi } from '../../../../utils/api/delete-list-api';
import { createCategoryOptionApi } from '../../../../utils/api/create-category-option-api';
import { updateListSettingsApi } from '../../../../utils/api/update-list-settings-api';
import { reorderListApi } from '../../../../utils/api/reorder-list-api';
import { existsAdmin, setAdmin } from '../../../../utils/api/firebase-admin-utils';
import { processedSyncTaskPath } from '../../../../utils/api/db-paths';
import { deleteCategoryOptionApi } from '../../../../utils/api/delete-category-option-api';
import { cleanUserChecklistsCache } from '../../../../utils/api/get-user-checklists-through-cache';

type SyncTaskProcessorMap = {
	[k in SyncTaskTypes]: (userId: string, task: SyncTask) => Promise<any>;
};

export const syncTaskProcessors: SyncTaskProcessorMap = {
	[SyncTaskTypes.CREATE_LIST]: (userId, task) => {
		const c = task as CreateListSyncTask;
		return createListApi(userId, c.payload);
	},
	[SyncTaskTypes.UPDATE_LIST]: (userId, task) => {
		const c = task as UpdateListSyncTask;
		return updateListApi(userId, c.payload.id as string, c.payload);
	},
	[SyncTaskTypes.DELETE_LIST]: async (userId, task) => {
		const c = task as DeleteListSyncTask;
		await deleteListApi(userId, c.payload);
		await cleanUserChecklistsCache(userId);
	},
	[SyncTaskTypes.CREATE_CATEGORY_OPTION]: (userId, task) => {
		const c = task as CreateCategoryOptionSyncTask;
		return createCategoryOptionApi(userId, c.payload);
	},
	[SyncTaskTypes.UPDATE_LIST_SETTINGS]: (userId: string, task) => {
		const c = task as UpdateListSettingsSyncTask;
		return updateListSettingsApi(userId, c.payload.listId, c.payload);
	},
	[SyncTaskTypes.REORDER_LIST]: (userId: string, task) => {
		const c = task as ReorderListSyncTask;
		return reorderListApi(userId, c.payload);
	},
	[SyncTaskTypes.DELETE_CATEGORY_OPTION]: (userId: string, task) => {
		const c = task as DeleteCategoryOptionSyncTask;
		return deleteCategoryOptionApi(userId, c.payload);
	}
};

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		// arrange by groups in descending order
		const tasks: SyncTask[] = await request.json();
		tasks.sort((a, b) => a.ts - b.ts);
		const groupsMap: { [groupId: string]: SyncTask[] } = {};
		for (const t of tasks) {
			const groupId = t.groupId || getUID();
			if (!groupsMap[groupId]) {
				groupsMap[groupId] = [];
			}
			groupsMap[groupId].push(t);
		}
		const groupIds = Object.keys(groupsMap);
		groupIds.sort((a, b) => groupsMap[a][0].ts - groupsMap[b][0].ts);
		// execute sync tasks
		const processed: string[] = [];
		for (const groupId of groupIds) {
			for (let i = 0; i < groupsMap[groupId].length; i++) {
				const t = groupsMap[groupId][i];
				try {
					const alreadyProcessed = await existsAdmin(processedSyncTaskPath(t.id));
					if (alreadyProcessed) {
						processed.push(t.id);
					} else {
						await syncTaskProcessors[t.type](user.uid, t);
						await setAdmin([
							{
								path: processedSyncTaskPath(t.id),
								value: 'SUCCESS'
							}
						]);
						processed.push(t.id);
					}
				} catch (e) {
					console.error('sync task error: ', e);
					for (let j = i; j < groupsMap[groupId].length; j++) {
						processed.push(groupsMap[groupId][i].id);
						await setAdmin([
							{
								path: processedSyncTaskPath(t.id),
								value: 'FAILED: ' + JSON.stringify(e)
							}
						]);
					}
					break;
				}
			}
		}
		return json({ processed });
	} catch (e) {
		console.log(e);
		return serverError();
	}
};
