import type { CategoryOption } from '../../types';
import { setAdmin } from './firebase-admin-utils';
import { categoryOptionsByUserByOptionPath } from './db-paths';

export const createCategoryOptionApi = async (
	userId: string,
	option: CategoryOption
): Promise<void> => {
	await setAdmin([{ path: categoryOptionsByUserByOptionPath(userId, option.id), value: option }]);
};
