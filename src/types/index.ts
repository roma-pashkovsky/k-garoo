import type { AppUser } from './auth';

export enum UserByListStatus {
	AUTHOR = 'author',
	SHARED_WITH = 'shared_with',
	PARTICIPANT = 'participant'
}

export type CheckList = {
	id: string;
	created_utc: number;
	updated_utc: number;
	name: string;
	items: CheckListItem[];
	isMyList?: boolean;
	// only for server Checklists
	isGroupByCategory?: boolean;
	sharedBy?: AppUser;
	createdById?: string;
};
export type CheckListItem = {
	id: string;
	itemDescription: string;
	category: CategoryOption;
	checked: boolean;
	orderAdded: number;
};

export type GroupedByCategoryItem = {
	category: CategoryOption;
	items: CheckListItemEditModel[];
};

export type CheckListItemEditModel = CheckListItem & {
	selected: boolean;
	isEdited: boolean;
	isDuplicate?: boolean;
};

export type CategoryOption = {
	id: string;
	name: string;
	color: string | undefined;
};

export type Proposition = {
	id: string;
	itemDescription: string;
	category: CategoryOption;
	lastUsedUTC: number;
};

export type ChecklistSettings = {
	isGroupByCategory?: boolean;
	hideCrossedOut?: boolean;
};

export type Language = 'en' | 'ua';
export type Theme = 'dark' | 'light' | undefined;

export type AppSettings = {
	version: number;
	lang: Language | undefined;
	isLocaleSet: boolean;
	hasSeenDemo: boolean;
	theme: Theme;
};

export type PersistedList = {
	[listId: string]: {
		updated_ts: number;
	};
};
