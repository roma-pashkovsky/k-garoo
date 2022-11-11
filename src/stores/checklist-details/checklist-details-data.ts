import type { CheckList, CheckListItem, ChecklistWithSettings, PersistedList } from '../../types';
import { get, writable } from 'svelte/store';
import { auth } from '../login/auth';
import { getListData, getListIds, setListData, setListIds } from '../../utils/local-storage-state';
import type {
	CreateListRequest,
	UpdateListRequest
} from '../../utils/api/client/create-update-list';
import type { UpdateChecklistSettingsRequest } from '../../utils/api/client/checklist-settings';
import { appFetch } from '../../utils/app-fetch';

export const listDataStore = writable<{ [listId: string]: ChecklistWithSettings | null }>({});

export const getList = async (
	listId: string,
	browser: boolean,
	f = fetch
): Promise<ChecklistWithSettings | null> => {
	let list: ChecklistWithSettings | null = null;
	if (browser) {
		list = await getListLocal(listId);
		listDataStore.update((prev) => ({ ...prev, [listId]: list }));
	}
	try {
		const fromApi = await appFetch<ChecklistWithSettings | null>(
			`/lists/${listId}`,
			{ method: 'GET' },
			f,
			10000
		);
		if (fromApi) {
			list = fromApi;
			listDataStore.update((prev) => ({ ...prev, [listId]: list }));
			setListData(list);
		}
	} catch (err) {
		console.error(err);
	}
	return list;
};

async function getListLocal(listId: string): Promise<CheckList | null> {
	return new Promise<CheckList | null>((resolve) => {
		requestAnimationFrame(() => {
			const listData = getListData(listId);
			if (listData) {
				const myLists = getListIds();
				const isMyList = !!myLists[listData.id];
				resolve({ ...listData, isMyList } as CheckList);
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
	if (get(auth).user) {
		await createListAPI(request);
	}
	return list;
};

async function createListAPI(request: CreateListRequest): Promise<CheckList | null> {
	return appFetch<CheckList>(
		`/lists/${request.id}`,
		{
			method: 'POST',
			body: JSON.stringify(request)
		},
		fetch,
		10000,
		request.id
	).catch((err) => {
		console.error(err);
		return null;
	});
}

export async function createListLocal(request: CreateListRequest): Promise<CheckList> {
	const ts = new Date().getTime();
	await addListToUserCollectionLocal(request.id as string, ts);
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

async function addListToUserCollectionLocal(listId: string, ts: number): Promise<void> {
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			const listIds = getListIds();
			const newLists = {
				...listIds,
				[listId]: {
					updated_ts: ts,
					order: getNewListInsertOrder(listIds)
				}
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
	return appFetch<CheckList>(
		`/lists/${request.id}`,
		{
			method: 'PUT',
			body: JSON.stringify(request)
		},
		undefined,
		10000,
		request.id
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
	await appFetch(
		`/lists/${listId}/settings`,
		{
			method: 'PUT',
			body: JSON.stringify(request)
		},
		fetch,
		5000,
		listId
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
	await appFetch(
		`/lists/${listId}/settings`,
		{
			method: 'PUT',
			body: JSON.stringify(request)
		},
		fetch,
		5000,
		listId
	).catch((err) => {
		console.error(err);
	});
}

async function setIsHideCrossedOutLocal(listId: string, isHideCrossedOut: boolean): Promise<void> {
	const listData = getListData(listId);
	setListData({ ...(listData as ChecklistWithSettings), hideCrossedOut: isHideCrossedOut });
}
