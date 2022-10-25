import type { CheckList, CheckListItem } from '../../types';

export const userPath = (userId: string) => `users/${userId}`;

export const listPath = (listId: string) => `listData/${listId}`;
export const listPropertyPath = (listId: string, propertyName: keyof CheckList) =>
	`listData/${listId}/${propertyName}`;
export const listItemPropertyPath = (
	listId: string,
	itemId: string,
	propertyName: keyof CheckListItem
) => `listData/${listId}/items/${itemId}/${propertyName}`;

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

export const stopListByMePath = (userId: string) => `stopListByMe/${userId}`;
export const stopListByMeByUserPath = (myId: string, userId: string) =>
	`stopListByMe/${myId}/${userId}`;

export const stopListAgainstMePath = (userId: string) => `stopListAgainstMe/${userId}`;
export const stopListAgainstMeByUserPath = (myId: string, userId: string) =>
	`stopListAgainstMe/${myId}/${userId}`;

export const categoryOptionsByUserPath = (userId: string) => `categoryOptionsByUsers/${userId}`;
export const categoryOptionsByUserByOptionPath = (userId: string, optionId: string) =>
	`categoryOptionsByUsers/${userId}/${optionId}`;
