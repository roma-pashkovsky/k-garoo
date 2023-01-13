import type { ListsByUser } from '../../types/fb-database';
import { redisGet, redisRemove, redisSet } from './redis';
import { redisListsByUserPath } from './redis-paths';
import { readOnceAdmin } from './firebase-admin-utils';
import { listsByMePath } from './db-paths';

const USER_LIST_EXPIRY_SECONDS = 5 * 60; // 5 minutes

export const getUserChecklistsThroughCache = async (userId: string): Promise<ListsByUser> => {
	const redisKey = redisListsByUserPath(userId);
	const cached = await redisGet<ListsByUser>(redisKey);
	if (cached) {
		console.log('>>>lists by user from redis');
		return cached;
	} else {
		console.log('>>>lists by user from db');
		const fromDb = await readOnceAdmin<ListsByUser>(listsByMePath(userId));
		redisSet(redisKey, fromDb, USER_LIST_EXPIRY_SECONDS);
		return fromDb;
	}
};

export const cleanUserChecklistsCache = async (userId: string): Promise<void> => {
	return redisRemove(redisListsByUserPath(userId));
};
