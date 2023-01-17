import { setAdmin } from './firebase-admin-utils';
import { categoryOptionsByUserByOptionPath } from './db-paths';

export const deleteCategoryOptionApi = async (userId: string, optionId: string): Promise<void> => {
	await setAdmin([
		{
			path: categoryOptionsByUserByOptionPath(userId, optionId),
			value: null
		}
	]);
};
