import { readOnceAdmin } from './firebase-admin-utils';
import { listsByMePath } from './db-paths';

export const getChildListIdForList = async (
	userId: string,
	listId: string
): Promise<string | null> => {
	const entryByParent = await readOnceAdmin(
		listsByMePath(userId),
		'parentListId',
		1,
		undefined,
		listId
	);
	if (entryByParent && Object.keys(entryByParent).length) {
		return Object.keys(entryByParent)[0];
	} else {
		return null;
	}
};
