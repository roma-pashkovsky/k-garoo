import type { CheckList, CheckListItem, ChecklistWithSettings, PersistedList } from '../../types';
import type { Readable } from 'svelte/store';
import { derived, get, writable } from 'svelte/store';
import { auth } from '../login/auth';
import { getListData, getListIds, setListData, setListIds } from '../../utils/local-storage-state';
import type {
	CreateListRequest,
	UpdateListRequest
} from '../../utils/api/client/create-update-list';
import type { UpdateChecklistSettingsRequest } from '../../utils/api/client/checklist-settings';
import { appFetch } from '../../utils/app-fetch';
import { acceptList } from '../my-shared-lists/my-shared-list.store';
import { getUID } from '../../utils/get-uid';
import { offline } from '../offline-mode/offline-mode.store';
import { translateChecklistCategories } from '../../utils/translate-checklist-categories';
import { AppSettingsStore } from '../app/app-settings';
import { SyncTaskTypes } from '../../utils/api/client/sync-task-types';
import type {
	CreateListSyncTask,
	UpdateListSyncTask,
	UpdateListSettingsSyncTask
} from '../../utils/api/client/sync-task-types';

export const listDataStore = writable<{ [listId: string]: ChecklistWithSettings | null }>({});

export const getChecklist = (id: string): Readable<ChecklistWithSettings | null> => {
	return derived(listDataStore, (data) => data[id] || null);
};

export const loadList = async (
	listId: string,
	browser: boolean,
	f = fetch
): Promise<ChecklistWithSettings | null> => {
	let list: ChecklistWithSettings | null = null;
	if (browser) {
		list = await getListLocal(listId);
		if (list) {
			list = {
				...list,
				items: translateChecklistCategories(get(AppSettingsStore.lang), list.items)
			};
		}
		listDataStore.update((prev) => ({ ...prev, [listId]: list }));
	}
	if (get(offline)) {
		return list;
	}
	try {
		const fromApi = await appFetch<ChecklistWithSettings | null>(
			`/lists/${listId}`,
			{ method: 'GET' },
			f,
			10000
		);
		if (fromApi) {
			list = {
				...fromApi,
				items: translateChecklistCategories(get(AppSettingsStore.lang), fromApi.items)
			};
			listDataStore.update((prev) => ({ ...prev, [listId]: list }));
			if (browser) {
				setListData(list);
			}
		}
	} catch (err) {
		console.error(err);
	}
	return list;
};

async function getListLocal(listId: string): Promise<CheckList | null> {
	const myLists = await getListIds();
	return new Promise<CheckList | null>((resolve) => {
		requestAnimationFrame(() => {
			const listData = getListData(listId);
			if (listData) {
				const isMyList = !!myLists[listData.id];
				let childListId: string | null = null;
				if (isMyList) {
					childListId =
						Object.keys(myLists || {}).find((id) => myLists[id].parentListId === listId) || null;
				}
				resolve({ ...listData, isMyList, childListId } as CheckList);
			} else {
				resolve(null);
			}
		});
	});
}

/**
 * Create list
 */
export const createList = async (request: CreateListRequest): Promise<CheckList> => {
	const list = await createListLocal(request);
	listDataStore.update((prev) => ({ ...prev, [list.id]: list }));
	if (get(auth).user) {
		await createListAPI(request);
	}
	return list;
};

async function createListAPI(request: CreateListRequest): Promise<CheckList | null> {
	const syncTask: CreateListSyncTask = {
		id: getUID(),
		payload: request,
		ts: new Date().getTime(),
		type: SyncTaskTypes.CREATE_LIST,
		groupId: request.id
	};
	return appFetch<CheckList>(
		`/lists/${request.id}`,
		{
			method: 'POST',
			body: JSON.stringify(request)
		},
		fetch,
		10000,
		syncTask
	).catch((err) => {
		console.error(err);
		return null;
	});
}

export async function createListLocal(request: CreateListRequest): Promise<CheckList> {
	const ts = new Date().getTime();
	await addListToUserCollectionLocal(request.id as string, ts, request.parentListId, request.name);
	await saveListDataLocal(
		request.id as string,
		request.name as string,
		request.items as CheckListItem[],
		ts
	);
	return getListLocal(request.id as string) as Promise<CheckList>;
}

async function saveListDataLocal(
	id: string,
	name: string,
	items: CheckListItem[],
	ts: number
): Promise<void> {
	const list = {
		id,
		items,
		name,
		created_utc: ts,
		updated_utc: ts
	} as CheckList;
	setListData(list);
}

async function addListToUserCollectionLocal(
	listId: string,
	ts: number,
	parentListId?: string,
	listName?: string
): Promise<void> {
	const listIds = await getListIds();
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			const record: PersistedList[string] = {
				updated_ts: ts,
				order: getNewListInsertOrder(listIds),
				name: listName
			};
			if (parentListId) {
				record.parentListId = parentListId;
			}
			const newLists = {
				...listIds,
				[listId]: record
			};
			setListIds(newLists);
			resolve();
		});
	});
}

function getNewListInsertOrder(listIds: PersistedList): number {
	if (!listIds || !Object.keys(listIds).length) {
		return 0;
	}
	const idArr = Object.keys(listIds);
	idArr.sort((a, b) => {
		return (listIds[b].order || 0) - (listIds[a].order || 0);
	});
	const lastListId = idArr[0];
	return (listIds[lastListId].order || 0) + 1000;
}

/**
 * Update list
 */
export const updateList = async (request: UpdateListRequest): Promise<CheckList> => {
	const updated: CheckList = await updateListLocal(request);
	listDataStore.update((prev) => ({ ...prev, [request.id as string]: updated }));
	if (get(auth).user) {
		await updateListAPI(request);
	}
	return updated;
};

async function updateListAPI(request: UpdateListRequest): Promise<CheckList | null> {
	const syncTask: UpdateListSyncTask = {
		id: getUID(),
		type: SyncTaskTypes.UPDATE_LIST,
		payload: request,
		ts: new Date().getTime(),
		groupId: request.id
	};
	return appFetch<CheckList>(
		`/lists/${request.id}`,
		{
			method: 'PUT',
			body: JSON.stringify(request)
		},
		undefined,
		10000,
		syncTask
	).catch((err) => {
		console.error(err);
		return null;
	});
}

async function updateListLocal(request: UpdateListRequest): Promise<CheckList> {
	const listId = request.id as string;
	const list: CheckList = await (getListLocal(listId) as Promise<CheckList>);
	if (!list.items) {
		list.items = [];
	}
	for (const prop in request) {
		if (prop === 'items') {
			const itemsUpdate = request['items'] as UpdateListRequest['items'];
			if (itemsUpdate?.added) {
				list.items.push(...itemsUpdate.added);
			}
			if (itemsUpdate?.updated) {
				Object.keys(itemsUpdate.updated).forEach((itemId) => {
					const updatedItem = (itemsUpdate.updated as any)[itemId];
					list.items = list.items.map((src) => {
						if (src.id === itemId) {
							return { ...src, ...updatedItem };
						} else {
							return src;
						}
					});
				});
			}
			if (itemsUpdate?.removed) {
				const removedMap: { [id: string]: true } = itemsUpdate.removed.reduce(
					(p, c) => ({ ...p, [c]: true }),
					{}
				);
				list.items = list.items.filter((it) => !removedMap[it.id]);
			}
		} else {
			(list as any)[prop] = request[prop as keyof UpdateListRequest];
		}
	}
	setListData(list);
	return getListLocal(listId) as Promise<CheckList>;
}

/**
 * Group by category
 */
export const setIsGroupedByCategory = async (
	listId: string,
	isByCategory: boolean
): Promise<void> => {
	listDataStore.update((prev) => {
		return {
			...prev,
			[listId]: {
				...(prev[listId] as ChecklistWithSettings),
				isGroupByCategory: isByCategory
			}
		};
	});
	const authUser = get(auth)?.user;
	setIsGroupedByCategoryLocal(listId, isByCategory);
	if (authUser) {
		await setIsGroupedByCategorySettingsAPI(listId, isByCategory);
	}
};

async function setIsGroupedByCategorySettingsAPI(
	listId: string,
	isByCategory: boolean
): Promise<void> {
	const request: UpdateChecklistSettingsRequest = {
		isGroupByCategory: isByCategory
	};
	const syncTask: UpdateListSettingsSyncTask = {
		id: getUID(),
		type: SyncTaskTypes.UPDATE_LIST_SETTINGS,
		payload: { ...request, listId },
		ts: new Date().getTime()
	};
	await appFetch(
		`/lists/${listId}/settings`,
		{
			method: 'PUT',
			body: JSON.stringify(request)
		},
		fetch,
		5000,
		syncTask
	).catch((err) => {
		console.error(err);
	});
}

function setIsGroupedByCategoryLocal(listId: string, isByCategory: boolean): void {
	const listData = getListData(listId);
	setListData({ ...(listData as ChecklistWithSettings), isGroupByCategory: isByCategory });
}

/**
 * Hide crossed out
 */
export const setHideCrossedOut = async (
	listId: string,
	isHideCrossedOut: boolean
): Promise<void> => {
	listDataStore.update((prev) => {
		return {
			...prev,
			[listId]: {
				...(prev[listId] as ChecklistWithSettings),
				hideCrossedOut: isHideCrossedOut
			}
		};
	});
	await setIsHideCrossedOutLocal(listId, isHideCrossedOut);
	if (get(auth).user) {
		await setIsHideCrossedOutSettingsAPI(listId, isHideCrossedOut);
	}
};

async function setIsHideCrossedOutSettingsAPI(
	listId: string,
	isHideCrossedOut: boolean
): Promise<void> {
	const request: UpdateChecklistSettingsRequest = {
		hideCrossedOut: isHideCrossedOut
	};
	const syncTask: UpdateListSettingsSyncTask = {
		id: getUID(),
		type: SyncTaskTypes.UPDATE_LIST_SETTINGS,
		payload: { ...request, listId },
		ts: new Date().getTime()
	};
	await appFetch(
		`/lists/${listId}/settings`,
		{
			method: 'PUT',
			body: JSON.stringify(request)
		},
		fetch,
		5000,
		syncTask
	).catch((err) => {
		console.error(err);
	});
}

async function setIsHideCrossedOutLocal(listId: string, isHideCrossedOut: boolean): Promise<void> {
	const listData = getListData(listId);
	setListData({ ...(listData as ChecklistWithSettings), hideCrossedOut: isHideCrossedOut });
}

/**
 * Calc mode
 */
export const setIsCalcMode = async (listId: string, isCalcMode: boolean): Promise<void> => {
	listDataStore.update((prev) => {
		return {
			...prev,
			[listId]: {
				...(prev[listId] as ChecklistWithSettings),
				isCalcMode
			}
		};
	});
	await setIsCalcModeLocal(listId, isCalcMode);
	if (get(auth).user) {
		await setIsCalcModeAPI(listId, isCalcMode);
	}
};

async function setIsCalcModeLocal(listId: string, isCalcMode: boolean): Promise<void> {
	const listData = getListData(listId);
	setListData({ ...(listData as ChecklistWithSettings), isCalcMode });
}

async function setIsCalcModeAPI(listId: string, isCalcMode: boolean): Promise<void> {
	const request: UpdateChecklistSettingsRequest = {
		isCalcMode
	};
	const syncTask: UpdateListSettingsSyncTask = {
		id: getUID(),
		type: SyncTaskTypes.UPDATE_LIST_SETTINGS,
		payload: { ...request, listId },
		ts: new Date().getTime()
	};
	await appFetch(
		`/lists/${listId}/settings`,
		{
			method: 'PUT',
			body: JSON.stringify(request)
		},
		fetch,
		5000,
		syncTask
	).catch((err) => {
		console.error(err);
	});
}

/**
 * Get list id by parent list id
 */
export async function getListIdByParentListId(
	parentListId: string,
	browser: boolean,
	f = fetch
): Promise<string | null> {
	if (get(auth).user && !get(offline)) {
		return getListIdByParentListIdAPI(parentListId, f).catch((err) => {
			console.error(err);
			if (browser) {
				return getListIdByParentListIdLocal(parentListId);
			} else {
				return null;
			}
		});
	} else if (browser) {
		return getListIdByParentListIdLocal(parentListId);
	} else {
		return Promise.resolve(null);
	}
}

async function getListIdByParentListIdLocal(parentListId: string): Promise<string | null> {
	const listIds = await getListIds();
	return new Promise<string | null>((resolve) => {
		requestAnimationFrame(() => {
			if (listIds) {
				const listId = Object.keys(listIds).find((id) => listIds[id].parentListId === parentListId);
				resolve(listId || null);
			} else {
				resolve(null);
			}
		});
	});
}

function getListIdByParentListIdAPI(parentListId: string, f: any): Promise<string | null> {
	return appFetch(`/list-by-parent-id/${parentListId}`, { method: 'GET' }, f, 5000);
}

/**
 * Add list to my collection
 */
export const addListToMyCollection = async (
	list: CheckList,
	parentListId: string
): Promise<string | null> => {
	const ts = new Date().getTime();
	if (!list) {
		return null;
	}
	if (get(auth).user) {
		const isSharedWithMe = !!list.sharedBy;
		if (isSharedWithMe) {
			await acceptList(list.id);
			return list.id;
		}
	}
	const copy: CheckList = {
		...list,
		id: getUID(),
		created_utc: ts,
		updated_utc: ts
	};
	await createList({ ...copy, parentListId });
	return copy.id;
};
