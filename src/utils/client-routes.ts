export const checklistDetailsClientRoute = (listId: string) => `/home/lists/details/${listId}`;
export const checklistDetailsClientEditRoute = (listId: string) =>
	`/home/lists/details/${listId}/edit`;
export const checklistDetailsClientLinkRoute = (listId: string) =>
	`/home/lists/details/${listId}/link`;
export const checklistDetailsClientShareTokenRoute = (listId: string) =>
	`/home/lists/details/${listId}/share-token`;

export const isChecklistDetailsClientRoute = (url: string) => {
	return url && url.indexOf('/lists/details/') >= 0;
};

export const mainListClientRoute = (lastVisitedId?: string) => {
	return lastVisitedId ? `/home/lists?lastVisitedId=${lastVisitedId}` : `/home/lists`;
};
