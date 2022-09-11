import type { CategoryOption } from './index';

export type ChangeCategoryEvent = {
	categoryId: string | undefined;
	newCategory: CategoryOption | undefined;
};
