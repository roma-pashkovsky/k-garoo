import type { CheckListItem } from './index';

export type DbChecklist = {
	id: string;
	name: string;
	created_utc: number;
	updated_utc: number;
	isGroupByCategory?: boolean;
	isCalcMode?: boolean;
	items: {
		[itemId: string]: CheckListItem;
	};
	createdById: string;
};
