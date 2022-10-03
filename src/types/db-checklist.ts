import type { CheckListItem } from './index';

export type DbChecklist = {
	id: string;
	name: string;
	created_utc: number;
	updated_utc: number;
	items: {
		[itemId: string]: CheckListItem;
	};
	createdById: string | undefined;
};
