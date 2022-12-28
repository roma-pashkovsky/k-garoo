import type { DbChecklist } from '../../types/db-checklist';
import { setAdmin } from './firebase-admin-utils';
import { listPropertyPath } from './db-paths';

export const validateChecklist = async (source: DbChecklist): Promise<DbChecklist> => {
	if (!source) {
		return source;
	}
	if (!source.items) {
		return source;
	}
	const itemIds = Object.keys(source.items);
	for (let i = 0; i < itemIds.length; i++) {
		const itemId = itemIds[i];
		const item = source.items[itemId];
		if (!(item.id && item.itemDescription && item.category)) {
			delete source.items[itemId];
			await setAdmin([{ path: `${listPropertyPath(source.id, 'items')}/${itemId}`, value: null }]);
		}
	}
	return source;
};
