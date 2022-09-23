import type {
	AppSettings,
	CategoryOption,
	CheckList,
	CheckListItem,
	ChecklistSettings,
	Proposition
} from '../../types';
import { getState, setState } from '../../utils/local-storage-state';

export class CheckListDetailsLocalStoragePersistence {
	public async getList(listId: string): Promise<CheckList> {
		const state = getState();
		const list = state.listData[listId];
		return Promise.resolve(list);
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
		const state = getState();
		if (state.listData[listId]) {
			return Promise.resolve(state.listData[listId].updated_utc || 0);
		}
		return Promise.resolve(undefined);
	}

	public async createList(id: string, name: string, items: CheckListItem[]): Promise<void> {
		await this.updatePropositionsWithItems(items);
		const state = getState();
		const listIds = state.listIds;
		listIds.unshift(id);
		setState({
			...state,
			listIds
		});
		await this.saveListData(id, name, items);
	}

	public async saveListName(id: string, name: string): Promise<void> {
		const state = getState();
		const list = state.listData[id];
		if (list) {
			list.name = name;
			setState({
				...state,
				listData: {
					...state.listData,
					[id]: { ...list, updated_utc: new Date().getTime() }
				}
			});
		}
	}

	public async upsertListItems(id: string, items: CheckListItem[]): Promise<void> {
		await this.updatePropositionsWithItems(items);
		const state = getState();
		const list = state.listData[id];
		if (list) {
			items.forEach((item) => {
				const itemInd = list.items.findIndex((it) => it.id === item.id);
				if (itemInd >= 0) {
					list.items.splice(itemInd, 1, item);
				} else {
					list.items.push(item);
				}
			});
			setState({
				...state,
				listData: {
					...state.listData,
					[id]: { ...list, updated_utc: new Date().getTime() }
				}
			});
		}
	}

	public async setListItems(id: string, items: CheckListItem[]): Promise<void> {
		const state = getState();
		const list = state.listData[id];
		list.items = [...items];
		setState({
			...state,
			listData: {
				...state.listData,
				[id]: { ...list, updated_utc: new Date().getTime() }
			}
		});
	}

	public async removeListItems(id: string, itemIds: string[]): Promise<void> {
		const state = getState();
		const list = state.listData[id];
		list.items = list.items.filter((it) => {
			return !itemIds.some((remId) => remId === it.id);
		});
		setState({
			...state,
			listData: {
				...state.listData,
				[id]: { ...list, updated_utc: new Date().getTime() }
			}
		});
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

	public async updateList({ id, items, name }: CheckList): Promise<void> {
		const state = getState();
		const oldListData = state.listData;
		const newListData = {
			...oldListData,
			[id]: {
				id,
				items,
				name,
				updated_utc: new Date().getTime()
			} as CheckList
		};
		setState({
			...state,
			listData: newListData
		});
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

	private async saveListData(id: string, name: string, items: CheckListItem[]): Promise<void> {
		const state = getState();
		const oldListData = state.listData;
		const newListData = {
			...oldListData,
			[id]: {
				id,
				items,
				name,
				created_utc: new Date().getTime(),
				updated_utc: new Date().getTime()
			} as CheckList
		};
		setState({
			...state,
			listData: newListData
		});
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
