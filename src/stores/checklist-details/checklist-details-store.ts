import type { CategoryOption, CheckList, Language } from '../../types';
import { CategoryOptionManager } from './category-option-manager';
import type { Readable } from 'svelte/store';
import { derived, get } from 'svelte/store';
import { AppSettingsStore } from '../app/app-settings';
import { CategoryAutodetector } from './category-autodetector';
import { getUID } from '../../utils/get-uid';
import { categoryOptionsByUser } from './category-options';
import { auth } from '../login/auth';
import { createList, createListLocal } from './checklist-details-data';
import { acceptList } from '../my-shared-lists/my-shared-list.store';
import { propositionStore } from './propositions';

export class ChecklistDetailsStore {
	private static customCategoryOptions = categoryOptionsByUser;

	public categoryOptions: Readable<CategoryOption[]>;

	constructor(checklist: CheckList, private locale: 'en' | 'ua') {
		this.categoryOptions = derived(
			[ChecklistDetailsStore.customCategoryOptions, propositionStore],
			([$customOptions, $propositionStore]) => {
				const manager = new CategoryOptionManager(
					$customOptions || [],
					checklist?.items || [],
					$propositionStore,
					this.locale
				);
				return manager.getCategoryOptions();
			}
		);
	}

	public getCategoryAutoDetector(): Readable<CategoryAutodetector> {
		return derived(propositionStore, (props) => {
			return new CategoryAutodetector(props, get(AppSettingsStore.lang) as Language);
		});
	}

	public async addListToMyCollection(
		list: CheckList,
		parentListId: string
	): Promise<string | null> {
		const ts = new Date().getTime();
		if (!list) {
			return null;
		}
		if (get(auth).user) {
			const isSharedWithMe = !!list.sharedBy;
			if (isSharedWithMe) {
				await acceptList(list.id);
				return list.id;
			}
		}
		const copy: CheckList = {
			...list,
			id: getUID(),
			created_utc: ts,
			updated_utc: ts
		};
		await createList({ ...copy, parentListId });
		return copy.id;
	}
}
