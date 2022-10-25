import type {
	CategoryOption,
	CheckList,
	CheckListItem,
	CheckListItemEditModel,
	ChecklistSettings,
	Language,
	Proposition
} from '../../types';
import { CheckListDetailsLocalStoragePersistence } from './check-list-details-local-storage-persistence';
import { CategoryOptionManager } from './category-option-manager';
import { PropositionsManager } from './propositions-manager';
import { FirebaseUtils } from '../../utils/firebase-utils';
import { ChecklistDetailsDbPersistence } from './checklist-details-db-persistence';
import type { Readable } from 'svelte/store';
import { derived, get, writable } from 'svelte/store';
import { AppSettingsStore } from '../app/app-settings';
import { CategoryAutodetector } from './category-autodetector';
import { getUID } from '../../utils/get-uid';
import { addCategoryOption, categoryOptionsByUser } from './category-options';
import { auth } from '../login/auth';

export class ChecklistDetailsStore {
	private static customCategoryOptions = categoryOptionsByUser;
	private static savedPropositions = writable<Proposition[]>([]);
	public static propositions = derived(
		[this.savedPropositions, AppSettingsStore.lang],
		([props, lang]) => {
			const manager = new PropositionsManager(props, lang as Language);
			return manager.getPropositions();
		}
	);

	private static isInit = false;
	private static firebaseUtils = new FirebaseUtils();
	private static persistence = new CheckListDetailsLocalStoragePersistence();
	private dbPersistence = new ChecklistDetailsDbPersistence();
	public static async init(): Promise<void> {
		if (!ChecklistDetailsStore.isInit) {
			// propositions
			const props = await this.persistence.getPropositions();
			this.savedPropositions.set(props || []);
			ChecklistDetailsStore.isInit = true;
		}
	}
	public categoryOptions: Readable<CategoryOption[]>;
	private get isLoggedIn(): boolean {
		return !!get(auth).user;
	}

	constructor(private checklist: CheckList, private locale: 'en' | 'ua') {
		this.categoryOptions = derived(
			ChecklistDetailsStore.customCategoryOptions,
			($customOptions) => {
				const manager = new CategoryOptionManager(
					$customOptions || [],
					checklist?.items || [],
					this.locale
				);
				return manager.getCategoryOptions();
			}
		);
	}

	public getCategoryAutoDetector(): Readable<CategoryAutodetector> {
		return derived(ChecklistDetailsStore.propositions, (props) => {
			return new CategoryAutodetector(props, get(AppSettingsStore.lang) as Language);
		});
	}

	// private async initList(): Promise<void> {
	// 	let isInUserCollection = false;
	// 	let list: CheckList | null = null;
	// 	if (!this.dbPersistence.isDbAvailable) {
	// 		isInUserCollection = await ChecklistDetailsStore.persistence.isListAddedToUserCollection(
	// 			this.listId
	// 		);
	// 		list = await ChecklistDetailsStore.persistence.getList(this.listId);
	// 	} else if (!this.dbPersistence.isLoggedIn) {
	// 		// db available
	// 		isInUserCollection = await ChecklistDetailsStore.persistence.isListAddedToUserCollection(
	// 			this.listId
	// 		);
	// 		list = await this.readListCacheFirst(this.listId);
	// 	} else {
	// 		// user logged in
	// 		isInUserCollection = await this.dbPersistence.isListAddedToUserCollection(
	// 			this.listId
	// 		);
	// 		if (isInUserCollection) {
	// 			list = await this.readListComparingVersions(this.listId);
	// 		} else {
	// 			list = await this.readListCacheFirst(this.listId);
	// 		}
	// 		if (isInUserCollection && !!list) {
	// 			await ChecklistDetailsStore.persistence.addListToUserCollection(
	// 				this.listId,
	// 				list.created_utc
	// 			);
	// 		}
	// 	}
	// 	this.isAddedToUsersList.set(isInUserCollection);
	// 	this.checklist.set(list);
	// }

	public async addListToMyCollection(list: CheckList): Promise<string | null> {
		const ts = new Date().getTime();
		if (list) {
			if (this.dbPersistence.isDbAvailable && this.dbPersistence.isLoggedIn) {
				const isSharedWithMe = !!list.sharedBy;
				if (isSharedWithMe) {
					await ChecklistDetailsStore.persistence.addListToUserCollection(list.id, ts);
					await this.dbPersistence.addListToUserCollection(list.id, ts);
					return list.id;
				} else {
					const copy: CheckList = {
						...list,
						id: getUID(),
						created_utc: ts,
						updated_utc: ts
					};
					await ChecklistDetailsStore.persistence.addListToUserCollection(copy.id, ts);
					await this.dbPersistence.addListToUserCollection(copy.id, ts);
					await ChecklistDetailsStore.persistence.updateList(copy);
					await this.dbPersistence.updateList(copy);
					return copy.id;
				}
			} else {
				const copy: CheckList = {
					...list,
					id: getUID(),
					created_utc: ts,
					updated_utc: ts
				};
				await ChecklistDetailsStore.persistence.addListToUserCollection(copy.id, ts);
				await ChecklistDetailsStore.persistence.updateList(copy);
				return copy.id;
			}
		}
		return null;
	}

	public async getChecklistSettings(): Promise<ChecklistSettings> {
		return ChecklistDetailsStore.persistence.getChecklistSettings();
	}

	public async setHideCrossedOut(listId: string, isHide: boolean): Promise<void> {
		return ChecklistDetailsStore.persistence.setHideCrossedOut(listId, isHide);
	}

	public async createList(
		id: string,
		name: string,
		editItems: CheckListItemEditModel[]
	): Promise<void> {
		const ts = new Date().getTime();
		const items = this.editModelsToChecklistItems(editItems);
		await ChecklistDetailsStore.persistence.createList(id, name, items, ts);
		if (get(auth).user) {
			await this.dbPersistence.upsertList(id, name, items, ts);
		}
		this.updatePropositionsWithItems(items);
	}

	public async saveListName(id: string, name: string): Promise<void> {
		const ts = new Date().getTime();
		await ChecklistDetailsStore.persistence.saveListName(id, name, ts);
		if (this.isLoggedIn) {
			await this.dbPersistence.saveListName(id, name, ts);
		}
	}

	public async upsertListItems(id: string, editItems: CheckListItemEditModel[]): Promise<void> {
		const ts = new Date().getTime();
		const items = this.editModelsToChecklistItems(editItems);
		await ChecklistDetailsStore.persistence.upsertListItems(id, items, ts);
		this.updatePropositionsWithItems(items);
		if (this.isLoggedIn) {
			await this.dbPersistence.upsertListItems(id, items, ts);
		}
	}

	public async removeListItems(id: string, itemIds: string[]): Promise<void> {
		const ts = new Date().getTime();
		await ChecklistDetailsStore.persistence.removeListItems(id, itemIds, ts);
		if (this.isLoggedIn) {
			await this.dbPersistence.removeListItems(id, itemIds, ts);
		}
	}

	public async setListItems(id: string, editItems: CheckListItemEditModel[]): Promise<void> {
		const ts = new Date().getTime();
		const items = this.editModelsToChecklistItems(editItems);
		await ChecklistDetailsStore.persistence.setListItems(id, items, ts);
		if (this.isLoggedIn) {
			return this.dbPersistence.setListItems(id, items, ts);
		}
	}

	public async addCategoryOption(option: CategoryOption): Promise<void> {
		return addCategoryOption(option);
	}

	public async updateByCategoryView(isByCategory: boolean): Promise<void> {
		return ChecklistDetailsStore.persistence.updateByCategoryView(isByCategory);
	}

	public async updateColorsForCategoriesView(isColors: boolean): Promise<void> {
		return ChecklistDetailsStore.persistence.updateIsColorsByCategories(isColors);
	}

	public setHasSeenDemo(): Promise<void> {
		return ChecklistDetailsStore.persistence.setHasSeenDemo();
	}

	public async updateProposition(prop: Proposition): Promise<void> {
		ChecklistDetailsStore.savedPropositions.update((oldProps) => {
			const index = oldProps.findIndex((p) => p.id === prop.id);
			if (index >= 0) {
				oldProps.splice(index, 1, prop);
			}
			return [...(oldProps || [])];
		});
		return ChecklistDetailsStore.persistence.setPropositions(
			get(ChecklistDetailsStore.propositions)
		);
	}

	private async updatePropositionsWithItems(items: CheckListItem[]): Promise<void> {
		ChecklistDetailsStore.savedPropositions.update((oldPropositions) => {
			const utc = new Date().getTime();
			const propsMap: { [desc: string]: Proposition } = (oldPropositions || []).reduce((p, c) => {
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
			return newPropositions;
		});
		await ChecklistDetailsStore.persistence.setPropositions(
			get(ChecklistDetailsStore.savedPropositions)
		);
	}

	private editModelsToChecklistItems(source: CheckListItemEditModel[]): CheckListItem[] {
		return source.map((s) => this.editModelToChecklistItem(s));
	}

	private editModelToChecklistItem(source: CheckListItemEditModel): CheckListItem {
		return {
			id: source.id,
			category: source.category,
			itemDescription: source.itemDescription,
			checked: source.checked,
			orderAdded: source.orderAdded
		};
	}
}
