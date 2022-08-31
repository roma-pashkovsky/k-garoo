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

export type CategoryOption = {
	name: string;
};

export type Proposition = {
	id: string;
	itemDescription: string;
	category: string;
};

export type KGarooState = {
	listIds: string[];
	listData: {
		[listId: string]: CheckList;
	};
	categoryOptions: CategoryOption[];
	propositions: Proposition[];
};
