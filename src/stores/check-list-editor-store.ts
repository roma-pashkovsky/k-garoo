import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type {
	AppSettings,
	CategoryOption,
	CheckListItem,
	ChecklistSettings,
	Proposition
} from '../types';
import { getState } from '../utils/local-storage-state';

export class CheckListEditorStore {
	public items: Writable<CheckListItem[]> = writable<CheckListItem[]>([]);
	public listName: Writable<string | null> = writable<string | null>(null);
	public categoryOptions: Writable<CategoryOption[]> = writable<CategoryOption[]>([]);
	public propositions: Writable<Proposition[]> = writable<Proposition[]>([]);
	public checklistSettings: Writable<ChecklistSettings> = writable<ChecklistSettings>({
		isGroupByCategory: false
	});
	public appSettings: Writable<AppSettings> = writable<AppSettings>({
		lang: undefined
	});

	constructor(private listId: string) {
		this.init(listId);
	}

	private init(listId: string): void {
		const state = getState();
		const list = state.listData[listId];
		this.listName.set(list.name);
		this.items.set(list.items);
		this.categoryOptions.set(state.categoryOptions);
		this.propositions.set(state.propositions);
		this.checklistSettings.set(state.checklistSettings);
		this.appSettings.set(state.appSettings);
	}
}
