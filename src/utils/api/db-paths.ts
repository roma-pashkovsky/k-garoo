import type { CheckListItem, ChecklistSettings } from '../../types';
import type { DbChecklist } from '../../types/db-checklist';

export const userPath = (userId: string) => `users/${userId}`;

export const listPath = (listId: string) => `listData/${listId}`;
export const listPropertyPath = (listId: string, propertyName: keyof DbChecklist) =>
	`listData/${listId}/${propertyName}`;
export const listItemPropertyPath = (
	listId: string,
	itemId: string,
	propertyName: keyof CheckListItem
) => `listData/${listId}/items/${itemId}/${propertyName}`;
export const listSearchPath = (listId: string) => `listSearch/${listId}`;

export const usersBySharedListPath = (listId: string) => `usersBySharedList/${listId}`;
export const userBySharedListPath = (listId: string, userId: string) =>
	`usersBySharedList/${listId}/${userId}`;

export const recentUsersPath = (byUserId: string) => `recentUsers/${byUserId}`;
export const recentUserPath = (byUserId: string, userId: string) =>
	`recentUsers/${byUserId}/${userId}`;

export const listsSharedWithMePath = (userId: string) => `listsSharedWithMe/${userId}`;
export const listSharedWithMePath = (userId: string, listId: string) =>
	`listsSharedWithMe/${userId}/${listId}`;

export const listsByMePath = (userId: string) => `listsByUsers/${userId}`;
export const listByMePath = (userId: string, listId: string) => `listsByUsers/${userId}/${listId}`;

export const listSettingsByMeByListPath = (userId: string, listId: string) =>
	`listSettingsByUsers/${userId}/${listId}`;
export const listSettingsByMeByListPropertyPath = (
	userId: string,
	listId: string,
	prop: keyof ChecklistSettings
) => `listSettingsByUsers/${userId}/${listId}/${prop}`;

export const stopListByMePath = (userId: string) => `stopListByMe/${userId}`;
export const stopListByMeByUserPath = (myId: string, userId: string) =>
	`stopListByMe/${myId}/${userId}`;

export const stopListAgainstMePath = (userId: string) => `stopListAgainstMe/${userId}`;
export const stopListAgainstMeByUserPath = (myId: string, userId: string) =>
	`stopListAgainstMe/${myId}/${userId}`;

export const categoryOptionsByUserPath = (userId: string) => `categoryOptionsByUsers/${userId}`;
export const categoryOptionsByUserByOptionPath = (userId: string, optionId: string) =>
	`categoryOptionsByUsers/${userId}/${optionId}`;

export const usersByListPath = (listId: string) => `usersByLists/${listId}`;
export const userByListPath = (listId: string, userId: string) =>
	`usersByLists/${listId}/${userId}`;

export const shareListInviteTokenPath = (token: string) => `shareListInviteTokens/${token}`;
