import type { Proposition } from '../../types';
import { reservedCategories, wordMap } from '../../utils/autodetect-data';
import { capitalize } from '../../utils/capitalize';

export class PropositionsManager {
	constructor(private propositions: Proposition[], private locale: 'en' | 'ua') {}

	public getPropositions(): Proposition[] {
		const propositionsMap: { [word: string]: any } = {};
		this.propositions.forEach((prop) => {
			propositionsMap[prop.itemDescription.toLowerCase()] = prop;
		});

		const filteredAutoPropositions: Proposition[] = Object.keys(wordMap)
			.map((wordId) => wordMap[wordId])
			.filter((wordItem) => !propositionsMap[wordItem[this.locale].toLowerCase()])
			.map((wordItem) => {
				return {
					id: wordItem.en,
					itemDescription: capitalize(wordItem[this.locale]),
					category: {
						id: wordItem.categoryId,
						name: reservedCategories[wordItem.categoryId][this.locale]
					},
					lastUsedUTC: 0
				} as Proposition;
			});
		return [...this.propositions, ...filteredAutoPropositions];
	}
}
