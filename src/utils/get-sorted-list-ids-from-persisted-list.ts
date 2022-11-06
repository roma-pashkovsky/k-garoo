import type { MainListItem, PersistedList } from '../types';

export const getSortedListIdsFromPersistedList = (list: PersistedList | null): MainListItem[] => {
	if (!list) {
		return [];
	}
	const ids = Object.keys(list);
	ids.sort((a, b) => list[b].order - list[a].order);
	return ids.map((id) => {
		return {
			id,
			name: list[id].name
		};
	});
};
