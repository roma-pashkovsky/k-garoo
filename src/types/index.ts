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
