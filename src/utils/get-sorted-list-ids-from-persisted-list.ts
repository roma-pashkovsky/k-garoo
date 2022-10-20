import type { PersistedList } from '../types';

export const getSortedListIdsFromPersistedList = (list: PersistedList): string[] => {
	if (!list) {
		return [];
	}
	const ids = Object.keys(list);
	ids.sort((a, b) => list[b].updated_ts - list[a].updated_ts);
	return ids;
};
