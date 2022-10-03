import type {
	AppSettings,
	CategoryOption,
	CheckList,
	CheckListItem,
	ChecklistSettings,
	Proposition
} from '../../types';
import {
	getListData,
	getListIds,
	getState,
	setListData,
	setListIds,
	setState
} from '../../utils/local-storage-state';

export class CheckListDetailsLocalStoragePersistence {
	public async getList(listId: string): Promise<CheckList | null> {
		return Promise.resolve(getListData(listId));
	}

	public async getCategoryOptions(): Promise<CategoryOption[]> {
		const state = getState();
		return Promise.resolve(state.categoryOptions);
	}

	public async getPropositions(): Promise<Proposition[]> {
		const state = getState();
		return Promise.resolve(state.propositions);
	}

	public async getChecklistSettings(): Promise<ChecklistSettings> {
		const state = getState();
		return Promise.resolve(state.checklistSettings);
	}

	public async getAppSettings(): Promise<AppSettings> {
		const state = getState();
		return Promise.resolve(state.appSettings);
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
		await this.updatePropositionsWithItems(items);
		const listIds = getListIds();
		listIds.unshift(id);
		setListIds(listIds);
		await this.saveListData(id, name, items, ts);
	}

	public async saveListName(id: string, name: string, ts: number): Promise<void> {
		const list = getListData(id);
		if (list) {
			list.name = name;
			setListData(list);
		}
	}

	public async upsertListItems(id: string, items: CheckListItem[], ts: number): Promise<void> {
		await this.updatePropositionsWithItems(items);
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
		const state = getState();
		const oldOptions = state.categoryOptions;
		const newOptions = [option, ...oldOptions];
		setState({
			...state,
			categoryOptions: newOptions
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

	public async updateList({ id, items, name }: CheckList, ts: number): Promise<void> {
		const newList = {
			id,
			items,
			name,
			updated_utc: ts
		} as CheckList;
		setListData(newList);
	}

	public async updateProposition(prop: Proposition): Promise<void> {
		const state = getState();
		const propositions = state.propositions;
		const index = propositions.findIndex((p) => p.id === prop.id);
		if (index >= 0) {
			propositions.splice(index, 1, prop);
			setState({
				...state,
				propositions
			});
		}
	}

	private async saveListData(
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

	private async updatePropositionsWithItems(items: CheckListItem[]): Promise<void> {
		const utc = new Date().getTime();
		const oldPropositions = await this.getPropositions();
		const propsMap: { [desc: string]: Proposition } = oldPropositions.reduce((p, c) => {
			return { ...p, [c.itemDescription.toLowerCase().trim()]: c };
		}, {});
		items.forEach((item) => {
			propsMap[item.itemDescription.toLowerCase().trim()] = {
				id: item.id,
				itemDescription: item.itemDescription,
				category: item.category,
				lastUsedUTC: utc
			};
		});
		let newPropositions = Object.keys(propsMap).map((propKey) => propsMap[propKey]);
		newPropositions.sort((a, b) => b.lastUsedUTC - a.lastUsedUTC);
		if (newPropositions.length > 100) {
			newPropositions = newPropositions.slice(0, 100);
		}
		const state = getState();
		setState({
			...state,
			propositions: newPropositions
		});
	}
}
