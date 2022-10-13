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

	private authSubscriptionId: string;
	private isLoggedIn = false;
	private onAuthChangedFn: ((isLoggedIn: boolean) => Promise<void>) | undefined = undefined;

	constructor(private listId: string, private locale: 'en' | 'ua') {
		ChecklistDetailsStore.persistence.getList(listId).then((list) => {
			this.checklist.set(list);
		});
		this.categoryOptions = derived(
			ChecklistDetailsStore.customCategoryOptions,
			($customOptions) => {
				const manager = new CategoryOptionManager($customOptions || [], this.locale);
				return manager.getCategoryOptions();
			}
		);
		this.authSubscriptionId = ChecklistDetailsStore.firebaseUtils.subscribeOnAuthChanged((user) => {
			this.isLoggedIn = !!user;
			if (this.onAuthChangedFn) {
				this.onAuthChangedFn(this.isLoggedIn);
			}
			this.getList(listId).then((list) => {
				this.checklist.set(list);
			});
		});
	}

	public getCategoryAutoDetector(): Readable<CategoryAutodetector> {
		return derived(ChecklistDetailsStore.propositions, (props) => {
			return new CategoryAutodetector(props, get(AppSettingsStore.lang) as Language);
		});
	}

	public doOnAuthChanged(cb: (isLoggedIn: boolean) => Promise<void>): void {
		this.onAuthChangedFn = cb;
	}

	public onDestroy(): void {
		ChecklistDetailsStore.firebaseUtils.unsubscribeOnAuthChanged(this.authSubscriptionId);
	}

	public async getList(listId: string): Promise<CheckList | null> {
		console.log('getting: ', listId);
		if (!ChecklistDetailsStore.dbPersistence.isDbAvailable) {
			return ChecklistDetailsStore.persistence.getList(listId);
		}
		const localVersion = await ChecklistDetailsStore.persistence.getListVersion(listId);
		console.log('local version: ', localVersion);
		const dbVersion = await ChecklistDetailsStore.dbPersistence.getListVersion(listId);
		console.log('db version: ', dbVersion);
		if ((localVersion || 0) >= (dbVersion || 0)) {
			const local = await ChecklistDetailsStore.persistence.getList(listId);
			console.log('local: ', local);
			if (local && this.isLoggedIn) {
				await ChecklistDetailsStore.dbPersistence.upsertList(
					local.id,
					local.name,
					local.items,
					local.updated_utc
				);
			}
			return local;
		} else {
			const remote = await ChecklistDetailsStore.dbPersistence.getList(listId);
			console.log('remote: ', remote);
			if (remote) {
				// add list to users collection if logged in
				if (this.isLoggedIn) {
					try {
						const isAddedToUserCollection =
							await ChecklistDetailsStore.dbPersistence.isListAddedToUserCollection(listId);
						console.log('checked');
						if (!isAddedToUserCollection) {
							await ChecklistDetailsStore.dbPersistence.addListToUserCollection(
								listId,
								remote.created_utc
							);
						}
					} catch (err) {
						console.log(err);
						console.log('Could not add to user collection');
					}
				}
				if (!localVersion) {
					await ChecklistDetailsStore.persistence.createList(
						remote.id,
						remote.name,
						remote.items,
						remote.updated_utc
					);
					this.updatePropositionsWithItems(remote.items);
				} else {
					await ChecklistDetailsStore.persistence.updateList(remote, remote.updated_utc);
				}
			}
			return remote;
		}
	}

	public async getChecklistSettings(): Promise<ChecklistSettings> {
		return ChecklistDetailsStore.persistence.getChecklistSettings();
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
		ChecklistDetailsStore.customCategoryOptions.update((prev) => [option, ...prev]);
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
			return [...oldProps];
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
