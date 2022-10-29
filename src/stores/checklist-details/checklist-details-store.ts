import type {
	CategoryOption,
	CheckList,
	CheckListItem,
	CheckListItemEditModel,
	Language,
	Proposition
} from '../../types';
import { CategoryOptionManager } from './category-option-manager';
import { PropositionsManager } from './propositions-manager';
import type { Readable } from 'svelte/store';
import { derived, get, writable } from 'svelte/store';
import { AppSettingsStore } from '../app/app-settings';
import { CategoryAutodetector } from './category-autodetector';
import { getUID } from '../../utils/get-uid';
import { addCategoryOption, categoryOptionsByUser } from './category-options';
import { auth } from '../login/auth';
import { createList, createListLocal } from './checklist-details-data';
import { acceptList } from '../my-shared-lists/my-shared-list.store';
import { getPropositions, setPropositions } from '../../utils/local-storage-state';

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
	public static async init(): Promise<void> {
		if (!ChecklistDetailsStore.isInit) {
			// propositions
			const props = getPropositions();
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

	public async addListToMyCollection(list: CheckList): Promise<string | null> {
		const ts = new Date().getTime();
		if (list) {
			if (get(auth)) {
				const isSharedWithMe = !!list.sharedBy;
				if (isSharedWithMe) {
					await acceptList(list.id);
					return list.id;
				} else {
					const copy: CheckList = {
						...list,
						id: getUID(),
						created_utc: ts,
						updated_utc: ts
					};
					await createList(copy);
					return copy.id;
				}
			} else {
				const copy: CheckList = {
					...list,
					id: getUID(),
					created_utc: ts,
					updated_utc: ts
				};
				await createListLocal(copy);
				return copy.id;
			}
		}
		return null;
	}

	public async createList(
		id: string,
		name: string,
		editItems: CheckListItemEditModel[]
	): Promise<void> {
		const ts = new Date().getTime();
		const items = this.editModelsToChecklistItems(editItems);
		this.updatePropositionsWithItems(items);
	}

	public async addCategoryOption(option: CategoryOption): Promise<void> {
		return addCategoryOption(option);
	}

	public async updateProposition(prop: Proposition): Promise<void> {
		ChecklistDetailsStore.savedPropositions.update((oldProps) => {
			const index = oldProps.findIndex((p) => p.id === prop.id);
			if (index >= 0) {
				oldProps.splice(index, 1, prop);
			}
			return [...(oldProps || [])];
		});
		return setPropositions(get(ChecklistDetailsStore.propositions));
	}

	public async updatePropositionsWithItems(items: CheckListItem[]): Promise<void> {
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
		setPropositions(get(ChecklistDetailsStore.savedPropositions));
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
