import type {
	ByListSettings,
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
import type { Readable, Writable } from 'svelte/store';
import { derived, get, writable } from 'svelte/store';
import { AppSettingsStore } from '../app/app-settings';
import { CategoryAutodetector } from './category-autodetector';

export class ChecklistDetailsStore {
	private static customCategoryOptions = writable<CategoryOption[]>([]);
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
	private static dbPersistence = new ChecklistDetailsDbPersistence();
	public static async init(): Promise<void> {
		if (!ChecklistDetailsStore.isInit) {
			// custom category options
			await this.setCategoryOptions();
			this.dbPersistence.onDbAvailableChange(() => this.setCategoryOptions());

			// propositions
			const props = await this.persistence.getPropositions();
			this.savedPropositions.set(props || []);
			ChecklistDetailsStore.isInit = true;
		}
	}

	private static async setCategoryOptions(): Promise<void> {
		if (this.dbPersistence.isLoggedIn) {
			const categoryOptionsDb = await this.dbPersistence.getCategoryOptions();
			await this.persistence.setCategoryOptions(categoryOptionsDb || []);
			this.customCategoryOptions.set(categoryOptionsDb);
		} else {
			const customCategoryOptions = await this.persistence.getCategoryOptions();
			this.customCategoryOptions.set(customCategoryOptions);
		}
	}
	public categoryOptions: Readable<CategoryOption[]>;
	public checklist: Writable<CheckList | null> = writable();
	public isAddedToUsersList: Writable<boolean> = writable(false);

	private authSubscriptionId: string;
	private isLoggedIn = false;
	private onAuthChangedFn: ((isLoggedIn: boolean) => Promise<void>) | undefined = undefined;

	constructor(private listId: string, private locale: 'en' | 'ua') {
		this.initList();
		this.categoryOptions = derived(
			[ChecklistDetailsStore.customCategoryOptions, this.checklist],
			([$customOptions, $checklist]) => {
				const manager = new CategoryOptionManager(
					$customOptions || [],
					$checklist?.items || [],
					this.locale
				);
				return manager.getCategoryOptions();
			}
		);
		this.authSubscriptionId = ChecklistDetailsStore.firebaseUtils.subscribeOnAuthChanged(
			async (user) => {
				this.isLoggedIn = !!user;
				if (this.onAuthChangedFn) {
					this.onAuthChangedFn(this.isLoggedIn);
				}
				await this.initList();
			}
		);
	}

	public getCategoryAutoDetector(): Readable<CategoryAutodetector> {
		return derived(ChecklistDetailsStore.propositions, (props) => {
			return new CategoryAutodetector(props, get(AppSettingsStore.lang) as Language);
		});
	}

	public onDestroy(): void {
		ChecklistDetailsStore.firebaseUtils.unsubscribeOnAuthChanged(this.authSubscriptionId);
	}

	private async initList(): Promise<void> {
		let isInUserCollection = false;
		let list: CheckList | null = null;
		if (!ChecklistDetailsStore.dbPersistence.isDbAvailable) {
			isInUserCollection = await ChecklistDetailsStore.persistence.isListAddedToUserCollection(
				this.listId
			);
			list = await ChecklistDetailsStore.persistence.getList(this.listId);
		} else if (!ChecklistDetailsStore.dbPersistence.isLoggedIn) {
			// db available
			isInUserCollection = await ChecklistDetailsStore.persistence.isListAddedToUserCollection(
				this.listId
			);
			list = await this.readListCacheFirst(this.listId);
		} else {
			// user logged in
			isInUserCollection = await ChecklistDetailsStore.dbPersistence.isListAddedToUserCollection(
				this.listId
			);
			if (isInUserCollection) {
				list = await this.readListComparingVersions(this.listId);
			} else {
				list = await this.readListCacheFirst(this.listId);
			}
			if (isInUserCollection && !!list) {
				await ChecklistDetailsStore.persistence.addListToUserCollection(
					this.listId,
					list.created_utc
				);
			}
		}
		this.isAddedToUsersList.set(isInUserCollection);
		this.checklist.set(list);
	}

	private async readListCacheFirst(listId: string): Promise<CheckList | null> {
		let list = await ChecklistDetailsStore.persistence.getList(this.listId);
		if (!list) {
			list = await ChecklistDetailsStore.dbPersistence.getList(this.listId);
			if (list) {
				const { id, items, name, updated_utc } = list;
				await ChecklistDetailsStore.persistence.saveListData(id, name, items, updated_utc);
			}
		}
		return list;
	}

	public async readListComparingVersions(listId: string): Promise<CheckList | null> {
		console.log('getting: ', listId);
		const localVersion = await ChecklistDetailsStore.persistence.getListVersion(listId);
		console.log('local version: ', localVersion);
		const dbVersion = await ChecklistDetailsStore.dbPersistence.getListVersion(listId);
		console.log('db version: ', dbVersion);
		if ((localVersion || 0) >= (dbVersion || 0)) {
			const local = await ChecklistDetailsStore.persistence.getList(listId);
			console.log('local: ', local);
			if (local) {
				await ChecklistDetailsStore.dbPersistence.updateList(local);
			}
			return local;
		} else {
			const remote = await ChecklistDetailsStore.dbPersistence.getList(listId);
			console.log('remote: ', remote);
			if (remote) {
				if (!localVersion) {
					await ChecklistDetailsStore.persistence.createList(
						remote.id,
						remote.name,
						remote.items,
						remote.updated_utc
					);
					this.updatePropositionsWithItems(remote.items);
				} else {
					await ChecklistDetailsStore.persistence.updateList(remote);
				}
			}
			return remote;
		}
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
		if (this.isLoggedIn) {
			await ChecklistDetailsStore.dbPersistence.upsertList(id, name, items, ts);
		}
		this.updatePropositionsWithItems(items);
	}

	public async saveListName(id: string, name: string): Promise<void> {
		const ts = new Date().getTime();
		await ChecklistDetailsStore.persistence.saveListName(id, name, ts);
		if (this.isLoggedIn) {
			await ChecklistDetailsStore.dbPersistence.saveListName(id, name, ts);
		}
	}

	public async upsertListItems(id: string, editItems: CheckListItemEditModel[]): Promise<void> {
		const ts = new Date().getTime();
		const items = this.editModelsToChecklistItems(editItems);
		await ChecklistDetailsStore.persistence.upsertListItems(id, items, ts);
		this.updatePropositionsWithItems(items);
		if (this.isLoggedIn) {
			await ChecklistDetailsStore.dbPersistence.upsertListItems(id, items, ts);
		}
	}

	public async removeListItems(id: string, itemIds: string[]): Promise<void> {
		const ts = new Date().getTime();
		await ChecklistDetailsStore.persistence.removeListItems(id, itemIds, ts);
		if (this.isLoggedIn) {
			await ChecklistDetailsStore.dbPersistence.removeListItems(id, itemIds, ts);
		}
	}

	public async setListItems(id: string, editItems: CheckListItemEditModel[]): Promise<void> {
		const ts = new Date().getTime();
		const items = this.editModelsToChecklistItems(editItems);
		await ChecklistDetailsStore.persistence.setListItems(id, items, ts);
		if (this.isLoggedIn) {
			return ChecklistDetailsStore.dbPersistence.setListItems(id, items, ts);
		}
	}

	public async addCategoryOption(option: CategoryOption): Promise<void> {
		await ChecklistDetailsStore.persistence.addCategoryOption(option);
		if (this.isLoggedIn) {
			await ChecklistDetailsStore.dbPersistence.addCategoryOption(option);
		}
		ChecklistDetailsStore.customCategoryOptions.update((prev) => [option, ...(prev || [])]);
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
