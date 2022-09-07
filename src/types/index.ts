export type CheckList = {
	id: string;
	created_utc: number;
	name: string;
	items: CheckListItem[];
};
export type CheckListItem = {
	id: string;
	itemDescription: string;
	category: string;
	checked: boolean;
};

export type CheckListItemEditModel = CheckListItem & {
	selected: boolean;
	isEdited: boolean;
};

export type CategoryOption = {
	id?: string;
	name: string;
};

export type Proposition = {
	id: string;
	itemDescription: string;
	category: string;
};

export type ChecklistSettings = {
	isGroupByCategory: boolean;
};

export type AppSettings = {
	lang: string | undefined;
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
