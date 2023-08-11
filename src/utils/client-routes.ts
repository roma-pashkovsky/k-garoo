import type { Language } from '../types';

export const checklistDetailsClientRoute = (listId: string) => `/home/details/${listId}`;
export const checklistDetailsClientEditRoute = (listId: string) => `/home/details/${listId}/edit`;
export const checklistDetailsClientLinkRoute = (listId: string) => `/home/details/${listId}/link`;
export const checklistDetailsClientShareTokenRoute = (listId: string) =>
	`/home/details/${listId}/share-token`;

export const isChecklistDetailsClientRoute = (url: string) => {
	return url && url.indexOf('/home/details/') >= 0;
};

export const mainListClientRoute = (lastVisitedId?: string) => {
	return lastVisitedId ? `/home/lists?lastVisitedId=${lastVisitedId}` : `/home/lists`;
};

export const privacyPolicyClientRoute = (lang: Language | undefined) =>
	`/home/privacy-policy/${lang || 'en'}`;
