import type { ListsByUser } from '../../types/fb-database';
import type { DbChecklist } from '../../types/db-checklist';
import { readOnceAdmin } from './firebase-admin-utils';
import { listsByMePath } from './db-paths';
import { getChecklistDataThroughCache } from './get-checklist-by-user-through-cache';

export const searchChecklists = async (
	userId: string,
	query: string
): Promise<{ [listId: string]: ListsByUser[string] & { name: string } }> => {
	if (!query?.length) {
		return {};
	}
	const lowerCaseQuery = query.toLowerCase();
	const listIdsByUser = (await readOnceAdmin<ListsByUser>(listsByMePath(userId))) as {
		[listId: string]: ListsByUser[string] & { name: string };
	};
	const listIds = Object.keys(listIdsByUser || {});
	const resultIds: (ListsByUser[string] & { name: string })[] = [];
	for (const listId of listIds) {
		const list = await getChecklistDataThroughCache(listId);
		const searchIndex = getDbChecklistSearchIndex(list);
		if (searchIndex.indexOf(lowerCaseQuery) >= 0) {
			listIdsByUser[listId].name = list.name;
		} else {
			delete listIdsByUser[listId];
		}
	}
	return listIdsByUser;
};

const getDbChecklistSearchIndex = (checklist: DbChecklist | null): string => {
	if (!checklist) {
		return '';
	}
	const indexItems = { [checklist.name.toLowerCase()]: true };
	Object.keys(checklist.items || {})
		.map((itemId) => checklist.items[itemId])
		.filter((it) => !!it.itemDescription && !!it.category)
		.forEach((it) => {
			it.itemDescription.split(' ').forEach((seg) => {
				indexItems[seg.slice(0, 5).toLowerCase()] = true;
			});
			indexItems[it.category.name.slice(0, 5).toLowerCase()] = true;
		});
	return Object.keys(indexItems).join(';');
};
