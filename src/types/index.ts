import type { AppUser } from './auth';

export type CheckList = {
	id: string;
	created_utc: number;
	updated_utc: number;
	name: string;
	items: CheckListItem[];
	isMyList?: boolean;
	sharedBy?: AppUser;
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
	isGroupByCategory: boolean;
	isColorsForCategories: boolean;
	hasSeenDemo: boolean;
	byList: {
		[listId: string]: ByListSettings;
	};
};

export type ByListSettings = {
	hideCrossedOut: boolean;
};

export type Language = 'en' | 'ua';
export type Theme = 'dark' | 'light' | undefined;

export type AppSettings = {
	version: number;
	lang: Language | undefined;
	isLocaleSet: boolean;
	theme: Theme;
};

export type AppInstructions = {
	isEditListFromDetailsViewed: boolean;
	isAddFromPropositionsViewed: boolean;
};

export type PersistedList = {
	[listId: string]: {
		updated_ts: number;
	};
};

export type KGarooState = {
	listIds: PersistedList;
	listData: {
		[listId: string]: CheckList;
	};
	categoryOptions: CategoryOption[];
	propositions: Proposition[];
	checklistSettings: ChecklistSettings;
	appSettings: AppSettings;
	appInstructions: AppInstructions;
};
