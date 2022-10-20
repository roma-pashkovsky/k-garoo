import type {
	ByListSettings,
	CategoryOption,
	CheckList,
	CheckListItem,
	ChecklistSettings,
	Proposition
} from '../../types';
import {
	getListData,
	getListIds,
	getPropositions,
	getState,
	setListData,
	setListIds,
	setPropositions,
	setState
} from '../../utils/local-storage-state';

export class CheckListDetailsLocalStoragePersistence {
	public async getList(listId: string): Promise<CheckList | null> {
		return new Promise<CheckList | null>((resolve) => {
			requestAnimationFrame(() => {
				resolve(getListData(listId));
			});
		});
	}

	public isListAddedToUserCollection(listId: string): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			requestAnimationFrame(() => {
				const listIds = getListIds();
				const isAdded = !!listIds[listId];
				resolve(isAdded);
			});
		});
	}

	public async getCategoryOptions(): Promise<CategoryOption[]> {
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				const state = getState();
				resolve(state.categoryOptions);
			});
		});
	}

	public setCategoryOptions(options: CategoryOption[]): Promise<void> {
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				const state = getState();
				setState({ ...state, categoryOptions: options });
				resolve();
			});
		});
	}

	public async getPropositions(): Promise<Proposition[]> {
		return new Promise<Proposition[]>((resolve) => {
			requestAnimationFrame(() => {
				const props = getPropositions();
				resolve(props);
			});
		});
	}

	public async getChecklistSettings(): Promise<ChecklistSettings> {
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				const state = getState();
				resolve(state.checklistSettings);
			});
		});
	}

	public async setHideCrossedOut(listId: string, isHide: boolean): Promise<void> {
		const state = getState();
		const settings = state.checklistSettings;
		const byList = settings.byList || {};
		const byCurrentList = (byList[listId] || {}) as ByListSettings;
		setState({
			...state,
			checklistSettings: {
				...settings,
				byList: {
					...byList,
					[listId]: {
						...byCurrentList,
						hideCrossedOut: isHide
					}
				}
			}
		});
	}

	public getListVersion(listId: string): Promise<number | undefined> {
		const list = getListData(listId);
		if (list) {
			return Promise.resolve(list.updated_utc || 0);
		}
		return Promise.resolve(undefined);
	}

	public async createList(
		id: string,
		name: string,
		items: CheckListItem[],
		ts: number
	): Promise<void> {
		await this.addListToUserCollection(id, ts);
		await this.saveListData(id, name, items, ts);
	}

	public async addListToUserCollection(listId: string, ts: number): Promise<void> {
		return new Promise<void>((resolve) => {
			requestAnimationFrame(() => {
				const listIds = getListIds();
				const newLists = {
					...listIds,
					[listId]: {
						updated_ts: ts
					}
				};
				setListIds(newLists);
				resolve();
			});
		});
	}

	public async saveListName(id: string, name: string, ts: number): Promise<void> {
		const list = getListData(id);
		if (list) {
			list.name = name;
			setListData(list);
		}
	}

	public async upsertListItems(id: string, items: CheckListItem[], ts: number): Promise<void> {
		const list = getListData(id);
		if (list) {
			items.forEach((item) => {
				const itemInd = list.items.findIndex((it) => it.id === item.id);
				if (itemInd >= 0) {
					list.items.splice(itemInd, 1, item);
				} else {
					list.items.push(item);
				}
			});
			setListData({ ...list, updated_utc: ts });
		}
	}

	public async setListItems(id: string, items: CheckListItem[], ts: number): Promise<void> {
		const state = getState();
		const list = state.listData[id];
		list.items = [...items];
		setListData({ ...list, updated_utc: ts });
	}

	public async removeListItems(id: string, itemIds: string[], ts: number): Promise<void> {
		const list = getListData(id);
		if (list) {
			list.items = list.items.filter((it) => {
				return !itemIds.some((remId) => remId === it.id);
			});
			setListData({ ...list, updated_utc: ts });
		}
	}

	public async addCategoryOption(option: CategoryOption): Promise<void> {
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				const state = getState();
				const oldOptions = state.categoryOptions || [];
				const newOptions = [option, ...oldOptions];
				setState({
					...state,
					categoryOptions: newOptions
				});
				resolve();
			});
		});
	}

	public async updateByCategoryView(isByCategory: boolean): Promise<void> {
		const state = getState();
		setState({
			...state,
			checklistSettings: {
				...state.checklistSettings,
				isGroupByCategory: isByCategory
			}
		});
	}

	public async updateIsColorsByCategories(isColors: boolean): Promise<void> {
		const state = getState();
		setState({
			...state,
			checklistSettings: {
				...state.checklistSettings,
				isColorsForCategories: isColors
			}
		});
	}

	public async setHasSeenDemo(): Promise<void> {
		const state = getState();
		setState({
			...state,
			checklistSettings: {
				...state.checklistSettings,
				hasSeenDemo: true
			}
		});
	}

	public async updateList({ id, items, name, updated_utc, created_utc }: CheckList): Promise<void> {
		const newList = {
			id,
			items,
			name,
			updated_utc,
			created_utc
		} as CheckList;
		await setListData(newList);
	}

	public async setPropositions(props: Proposition[]): Promise<void> {
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				setPropositions(props);
				resolve();
			});
		});
	}

	public async saveListData(
		id: string,
		name: string,
		items: CheckListItem[],
		ts: number
	): Promise<void> {
		const list = {
			id,
			items,
			name,
			created_utc: ts,
			updated_utc: ts
		} as CheckList;
		setListData(list);
	}
}
