import type { CreateListRequest, UpdateListRequest } from './create-update-list';
import type { UpdateChecklistSettingsRequest } from './checklist-settings';
import type { CategoryOption } from '../../../types';

export enum SyncTaskTypes {
	CREATE_LIST = 'CREATE_LIST',
	DELETE_LIST = 'DELETE_LIST',
	UPDATE_LIST = 'UPDATE_LIST',
	UPDATE_LIST_SETTINGS = 'UPDATE_LIST_SETTINGS',
	REORDER_LIST = 'REORDER_LIST',
	CREATE_CATEGORY_OPTION = 'CREATE_CATEGORY_OPTION',
	DELETE_CATEGORY_OPTION = 'DELETE_CATEGORY_OPTION'
}

export interface CreateListSyncTask {
	id: string;
	type: SyncTaskTypes.CREATE_LIST;
	payload: CreateListRequest;
	groupId?: string;
	ts: number;
}

export interface DeleteListSyncTask {
	id: string;
	type: SyncTaskTypes.DELETE_LIST;
	payload: string;
	groupId?: string;
	ts: number;
}

export interface UpdateListSyncTask {
	id: string;
	type: SyncTaskTypes.UPDATE_LIST;
	payload: UpdateListRequest;
	groupId?: string;
	ts: number;
}

export interface UpdateListSettingsSyncTask {
	id: string;
	type: SyncTaskTypes.UPDATE_LIST_SETTINGS;
	payload: UpdateChecklistSettingsRequest & { listId: string };
	groupId?: string;
	ts: number;
}

export interface CreateCategoryOptionSyncTask {
	id: string;
	type: SyncTaskTypes.CREATE_CATEGORY_OPTION;
	payload: CategoryOption;
	groupId?: string;
	ts: number;
}

export interface DeleteCategoryOptionSyncTask {
	id: string;
	type: SyncTaskTypes.DELETE_CATEGORY_OPTION;
	// option id
	payload: string;
	groupId?: string;
	ts: number;
}

export interface ReorderListSyncTask {
	id: string;
	type: SyncTaskTypes.REORDER_LIST;
	payload: string[];
	ts: number;
	groupId?: string;
}

export type SyncTask =
	| CreateListSyncTask
	| UpdateListSyncTask
	| DeleteListSyncTask
	| CreateCategoryOptionSyncTask
	| UpdateListSettingsSyncTask
	| ReorderListSyncTask
	| DeleteCategoryOptionSyncTask;
