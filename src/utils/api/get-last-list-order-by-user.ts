import type { ListsByUser } from '../../types/fb-database';
import { readOnceAdmin } from './firebase-admin-utils';
import { listsByMePath } from './db-paths';
import { ORDERING_GAP } from './ordering-gap';

export const getListInsertOrderByUser = async (userId: string): Promise<number> => {
	const lastList = await readOnceAdmin<ListsByUser>(listsByMePath(userId), 'order', undefined, 1);
	return lastList ? (lastList[Object.keys(lastList)[0]].order || 0) + ORDERING_GAP : 0;
};
