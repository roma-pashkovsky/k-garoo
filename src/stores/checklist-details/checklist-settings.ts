import type { ChecklistSettings } from '../../types';
import { get } from 'svelte/store';
import { auth } from '../login/auth';
import {
	getListSettingsLocalStorage,
	setListSettingsLocalStorage
} from '../../utils/local-storage-state';
import type { UpdateChecklistSettingsRequest } from '../../utils/api/client/checklist-settings';
import type { UpdateListRequest } from '../../utils/api/client/create-update-list';

export const getListSettings = async (
	listId: string,
	browser: boolean,
	f = fetch
): Promise<ChecklistSettings | null> => {
	if (get(auth).user) {
		return fetchListSettings(listId, f);
	} else if (browser) {
		return getListSettingsLocalStorage(listId);
	} else {
		return null;
	}
};

async function fetchListSettings(listId: string, f: any): Promise<ChecklistSettings> {
	const resp = await f(`/api/v1/lists/${listId}/settings`, { method: 'GET' });
	return resp.json();
}

/**
 * Group by category
 */
export const setIsGroupedByCategory = async (
	listId: string,
	isByCategory: boolean,
	createdById: string
): Promise<void> => {
	const authUser = get(auth)?.user;
	if (authUser) {
		await setIsGroupedByCategorySettingsAPI(listId, isByCategory);
		if (authUser.id === createdById) {
			await setIsGroupedByCategoryDefaultForListAPI(listId, isByCategory);
		}
	} else {
		setIsGroupedByCategoryLocal(listId, isByCategory);
	}
};

async function setIsGroupedByCategorySettingsAPI(
	listId: string,
	isByCategory: boolean
): Promise<void> {
	const request: UpdateChecklistSettingsRequest = {
		isGroupByCategory: isByCategory
	};
	await fetch(`/api/v1/lists/${listId}/settings`, {
		method: 'PUT',
		body: JSON.stringify(request)
	});
}

async function setIsGroupedByCategoryDefaultForListAPI(
	listId: string,
	isByCategory: boolean
): Promise<void> {
	const request: UpdateListRequest = {
		id: listId,
		isGroupByCategory: isByCategory
	};
	await fetch(`/api/v1/lists/${listId}`, {
		method: 'PUT',
		body: JSON.stringify(request)
	});
}

function setIsGroupedByCategoryLocal(listId: string, isByCategory: boolean): void {
	const settings = getListSettingsLocalStorage(listId);
	const upd: ChecklistSettings = {
		...(settings || {}),
		isGroupByCategory: isByCategory
	};
	setListSettingsLocalStorage(listId, upd);
}

/**
 * Hide crossed out
 */
export const setHideCrossedOut = async (
	listId: string,
	isHideCrossedOut: boolean
): Promise<void> => {
	if (get(auth).user) {
		await setIsHideCrossedOutSettingsAPI(listId, isHideCrossedOut);
	} else {
		await setIsHideCrossedOutLocal(listId, isHideCrossedOut);
	}
};

async function setIsHideCrossedOutSettingsAPI(
	listId: string,
	isHideCrossedOut: boolean
): Promise<void> {
	const request: UpdateChecklistSettingsRequest = {
		hideCrossedOut: isHideCrossedOut
	};
	await fetch(`/api/v1/lists/${listId}/settings`, {
		method: 'PUT',
		body: JSON.stringify(request)
	});
}

async function setIsHideCrossedOutLocal(listId: string, isHideCrossedOut: boolean): Promise<void> {
	const settings = getListSettingsLocalStorage(listId);
	const upd: ChecklistSettings = {
		...(settings || {}),
		hideCrossedOut: isHideCrossedOut
	};
	setListSettingsLocalStorage(listId, upd);
}
