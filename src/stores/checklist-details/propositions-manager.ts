import type { Proposition } from '../../types';
import { reservedCategories, wordMap } from '../../utils/autodetect-data';
import { capitalize } from '../../utils/capitalize';

export class PropositionsManager {
	private static autoPropositions: Proposition[];

	private static getAutoPropositions(): Proposition[] {
		const res: Proposition[] = [];
		Object.keys(wordMap)
			.map((wordId) => wordMap[wordId])
			.forEach((wordItem) => {
				Object.keys(wordItem)
					.filter((key) => key !== 'categoryId')
					.forEach((l: string) => {
						const t = (wordItem as any)[l] as string;
						res.push({
							id: t,
							itemDescription: capitalize(t),
							category: {
								id: wordItem.categoryId,
								name: reservedCategories[wordItem.categoryId]['en']
							},
							lastUsedUTC: 0
						});
					});
			});
		return res;
	}

	constructor(private propositions: Proposition[], private locale: 'en' | 'ua') {
		if (!PropositionsManager.autoPropositions) {
			PropositionsManager.autoPropositions = PropositionsManager.getAutoPropositions();
		}
	}

	public getPropositions(): Proposition[] {
		const propositionsMap: { [word: string]: any } = {};
		this.propositions.forEach((prop) => {
			propositionsMap[prop.itemDescription.toLowerCase()] = prop;
		});

		const filteredAutoPropositions: Proposition[] = PropositionsManager.autoPropositions
			.filter((auto) => {
				return !propositionsMap[auto.itemDescription.toLowerCase()];
			})
			.map((prop) => {
				return {
					...prop,
					category: {
						...prop.category,
						name: reservedCategories[prop.category.id][this.locale]
					}
				};
			});

		return [...this.propositions, ...filteredAutoPropositions];
	}
}
