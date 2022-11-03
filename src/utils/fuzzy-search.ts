export interface FuzzyOptions<T> {
	includeScore?: boolean;
	keys?: (keyof T)[];
	shouldSort?: boolean;
	minMatchCharLength?: number;
	threshold?: number; // 0 - full match, 1 - match any
}

export class FuzzySearch<T> {
	private _fuze: any;
	constructor(items: T[], options: FuzzyOptions<T>) {
		this._fuze = new (window as any).Fuse(items, options);
		if (!this._fuze) {
			setTimeout(() => {
				this._fuze = new (window as any).Fuse(items, options);
			}, 4000);
		}
	}

	public search(t: string): { item: T; score?: number }[] {
		return this._fuze.search(t) as { item: T; score?: number }[];
	}
}
