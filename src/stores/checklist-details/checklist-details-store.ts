import type {
	AppSettings,
	CategoryOption,
	CheckListItem,
	CheckListItemEditModel,
	ChecklistSettings,
	Proposition,
	CheckList
} from '../../types';
import { CheckListDetailsLocalStoragePersistence } from './check-list-details-local-storage-persistence';
import { CategoryOptionManager } from './category-option-manager';
import { PropositionsManager } from './propositions-manager';

export class ChecklistDetailsStore {
	private persistence = new CheckListDetailsLocalStoragePersistence();

	constructor(private locale: 'en' | 'ua') {}

	public async getList(listId: string): Promise<CheckList> {
		return this.persistence.getList(listId);
	}

	public async getCategoryOptions(): Promise<CategoryOption[]> {
		return this.persistence.getCategoryOptions().then((options) => {
			const manager = new CategoryOptionManager(options || [], this.locale);
			return manager.getCategoryOptions();
		});
	}

	public async getPropositions(): Promise<Proposition[]> {
		return this.persistence.getPropositions().then((props) => {
			const manager = new PropositionsManager(props || [], this.locale);
			return manager.getPropositions();
		});
	}

	public async getChecklistSettings(): Promise<ChecklistSettings> {
		return this.persistence.getChecklistSettings();
	}

	public async getAppSettings(): Promise<AppSettings> {
		return this.persistence.getAppSettings();
	}

	public async createList(
		id: string,
		name: string,
		editItems: CheckListItemEditModel[]
	): Promise<void> {
		return this.persistence.createList(id, name, editItems);
	}

	public async saveListName(id: string, name: string): Promise<void> {
		return this.persistence.saveListName(id, name);
	}

	public async upsertListItems(id: string, editItems: CheckListItemEditModel[]): Promise<void> {
		return this.persistence.upsertListItems(id, this.editModelsToChecklistItems(editItems));
	}

	public async removeListItems(id: string, itemIds: string[]): Promise<void> {
		return this.persistence.removeListItems(id, itemIds);
	}

	public async setListItems(id: string, editItems: CheckListItemEditModel[]): Promise<void> {
		return this.persistence.setListItems(id, this.editModelsToChecklistItems(editItems));
	}

	public async addCategoryOption(option: CategoryOption): Promise<void> {
		return this.persistence.addCategoryOption(option);
	}

	public async updateByCategoryView(isByCategory: boolean): Promise<void> {
		return this.persistence.updateByCategoryView(isByCategory);
	}

	public async updateColorsForCategoriesView(isColors: boolean): Promise<void> {
		return this.persistence.updateIsColorsByCategories(isColors);
	}

	public setHasSeenDemo(): Promise<void> {
		return this.persistence.setHasSeenDemo();
	}

	public async updateProposition(prop: Proposition): Promise<void> {
		return this.persistence.updateProposition(prop);
	}

	private editModelsToChecklistItems(source: CheckListItemEditModel[]): CheckListItem[] {
		return source.map((s) => this.editModelToChecklistItem(s));
	}

	private editModelToChecklistItem(source: CheckListItemEditModel): CheckListItem {
		return {
			id: source.id,
			category: source.category,
			itemDescription: source.itemDescription,
			checked: source.checked
		};
	}
}
