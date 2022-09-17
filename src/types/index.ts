export type CheckList = {
	id: string;
	created_utc: number;
	updated_utc: number;
	name: string;
	items: CheckListItem[];
};
export type CheckListItem = {
	id: string;
	itemDescription: string;
	category: CategoryOption;
	checked: boolean;
};

export type GroupedByCategoryItem = {
	category: CategoryOption;
	items: CheckListItem[];
};

export type CheckListItemEditModel = CheckListItem & {
	selected: boolean;
	isEdited: boolean;
	isDuplicate?: boolean;
};

export type CategoryOption = {
	id: string;
	name: string;
};

export type Proposition = {
	id: string;
	itemDescription: string;
	category: CategoryOption;
	lastUsedUTC: number;
};

export type ChecklistSettings = {
	isGroupByCategory: boolean;
	hasSeenDemo: boolean;
};

export type AppSettings = {
	lang: string | undefined;
	isLocaleSet: boolean;
	theme: 'dark' | 'light';
};

export type AppInstructions = {
	isEditListFromDetailsViewed: boolean;
	isAddFromPropositionsViewed: boolean;
};

export type KGarooState = {
	listIds: string[];
	listData: {
		[listId: string]: CheckList;
	};
	categoryOptions: CategoryOption[];
	propositions: Proposition[];
	checklistSettings: ChecklistSettings;
	appSettings: AppSettings;
	appInstructions: AppInstructions;
	appVersion: number;
};
