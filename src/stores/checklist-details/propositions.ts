import { derived, writable, get } from 'svelte/store';
import type { CheckListItem, Proposition } from '../../types';
import { getPropositions, setPropositions } from '../../utils/local-storage-state';
import { AppSettingsStore } from '../app/app-settings';
import { PropositionsManager } from './propositions-manager';

const savedPropositions = writable<Proposition[]>([]);

export const propositionStore = derived(
	[savedPropositions, AppSettingsStore.lang],
	([props, lang]) => {
		return new PropositionsManager(props, lang as 'en' | 'ua').getPropositions();
	}
);

let isInit = false;

export const initPropositions = () => {
	if (!isInit) {
		const local = getPropositions();
		savedPropositions.set(local);
		isInit = true;
	}
};

export const updatePropositionsWithItems = (items: CheckListItem[]): void => {
	savedPropositions.update((oldPropositions) => {
		const utc = new Date().getTime();
		const propsMap: { [desc: string]: Proposition } = (oldPropositions || [])
			.filter((p) => !!p.itemDescription)
			.reduce((p, c) => {
				return { ...p, [c.itemDescription.toLowerCase().trim()]: c };
			}, {});
		items
			.filter((it) => !!it.itemDescription)
			.forEach((item) => {
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
	setPropositions(get(savedPropositions));
};

export const updateProposition = (prop: Proposition) => {
	savedPropositions.update((oldProps) => {
		const index = oldProps.findIndex((p) => p.id === prop.id);
		if (index >= 0) {
			oldProps.splice(index, 1, prop);
		}
		return [...(oldProps || [])];
	});
	return setPropositions(get(savedPropositions));
};
