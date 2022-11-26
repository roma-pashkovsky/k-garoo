export const checklistDetailsClientRoute = (listId: string) => `/home/lists/details/${listId}`;
export const isChecklistDetailsClientRoute = (url: string) => {
	return url && url.indexOf('/lists/details/') >= 0;
};
