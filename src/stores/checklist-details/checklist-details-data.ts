import type { CheckList } from '../../types';
import type { CheckListItem } from '../../types';
import { get, writable } from 'svelte/store';
import { auth } from '../login/auth';
import { getListData, getListIds, setListData, setListIds } from '../../utils/local-storage-state';
import type {
	CreateListRequest,
	UpdateListRequest
} from '../../utils/api/client/create-update-list';

export const listDataStore = writable<{ [listId: string]: CheckList | null }>({});

export const getList = async (
	listId: string,
	browser: boolean,
	f = fetch
): Promise<CheckList | null> => {
	let list: CheckList | null;
	if (get(auth)?.user) {
		list = await getListAPIFirst(listId, f, browser);
	} else {
		list = await getListBrowserFirst(listId, f, browser);
	}
	listDataStore.update((prev) => ({ ...prev, [listId]: list }));
	return list;
};

async function getListAPIFirst(
	listId: string,
	f: any,
	browser: boolean
): Promise<CheckList | null> {
	console.log('getting list api first');
	const listAPI = await getListFromApi(listId, f);
	if (listAPI) {
		return listAPI;
	} else if (browser) {
		return getListLocal(listId);
	} else {
		return null;
	}
}

async function getListBrowserFirst(
	listId: string,
	f: any,
	browser: boolean
): Promise<CheckList | null> {
	console.log('getting list browser first');
	if (browser) {
		const local = await getListLocal(listId);
		if (local) {
			return local;
		} else {
			return getListFromApi(listId, f);
		}
	} else {
		return getListFromApi(listId, f);
	}
}

async function getListFromApi(listId: string, f: any): Promise<CheckList | null> {
	const listResp = await f(`/api/v1/lists/${listId}`);
	return listResp.json();
}

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
	if (get(auth).user) {
		return createListAPI(request);
	} else {
		return createListLocal(request);
	}
};

async function createListAPI(request: CreateListRequest): Promise<CheckList> {
	const resp = await fetch(`/api/v1/lists/${request.id}`, {
		method: 'POST',
		body: JSON.stringify(request)
	});
	return (await resp.json()) as CheckList;
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
					updated_ts: ts
				}
			};
			setListIds(newLists);
			resolve();
		});
	});
}

/**
 * Update list
 */
export const updateList = async (request: UpdateListRequest): Promise<CheckList> => {
	let updated: CheckList;
	if (get(auth).user) {
		updated = await updateListAPI(request);
	} else {
		updated = await updateListLocal(request);
	}
	listDataStore.update((prev) => ({ ...prev, [request.id as string]: updated }));
	return updated;
};

async function updateListAPI(request: UpdateListRequest): Promise<CheckList> {
	const resp = await fetch(`/api/v1/lists/${request.id}`, {
		method: 'PUT',
		body: JSON.stringify(request)
	});
	return resp.json() as Promise<CheckList>;
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
