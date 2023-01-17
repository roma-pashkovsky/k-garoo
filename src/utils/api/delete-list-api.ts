import { setAdmin } from './firebase-admin-utils';
import { listByMePath, userByListPath } from './db-paths';

export const deleteListApi = async (userId: string, listId: string): Promise<void> => {
	await setAdmin([
		{ path: listByMePath(userId, listId), value: null },
		{ path: userByListPath(listId, userId), value: null }
	]);
};
