import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { CategoryOption, ChecklistSettings, KGarooState, Proposition } from '../types';
export class CheckListsStore {
	public static listIds: Writable<string[]> = writable<string[]>([]);
	public static listData: Writable<KGarooState['listData']> = writable<KGarooState['listData']>({});
	public static categoryOptions: Writable<CategoryOption[]> = writable<CategoryOption[]>([]);
	public static propositions: Writable<Proposition[]> = writable<Proposition[]>([]);
	public static checklistSettings: Writable<ChecklistSettings> = writable<ChecklistSettings>({
		lang: undefined,
		isGroupByCategory: false
	});

	public init(): void {}
}
