import type { CategoryOption, Proposition } from '../../types';
import { FuzzySearch } from '../../utils/fuzzy-search';
import { reservedCategories } from '../../utils/autodetect-data';

export class CategoryAutodetector {
	private propositionsFuzzy: FuzzySearch<Proposition>;
	constructor(propositions: Proposition[], private locale: 'en' | 'ua') {
		const prepared: Proposition[] = propositions.map((p) => ({
			...p,
			itemDescription: p.itemDescription.toLowerCase()
		}));
		this.propositionsFuzzy = new FuzzySearch<Proposition>(prepared, {
			keys: ['itemDescription'],
			threshold: 0.1,
			shouldSort: true,
			includeScore: true
		});
	}

	public detect(description: string): CategoryOption | null {
		if (description.length < 4) {
			return null;
		}
		const searchRes = this.propositionsFuzzy.search(description.toLowerCase());
		if (searchRes?.length) {
			const topMatch = searchRes[0];
			const reserved = reservedCategories[topMatch.item.category.id];

			if (reserved) {
				return {
					id: reserved.id,
					color: reserved.color,
					name: reserved[this.locale]
				};
			} else {
				return topMatch.item.category;
			}
		} else {
			return null;
		}
	}
}
