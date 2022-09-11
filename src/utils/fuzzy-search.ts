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
	}

	public search(t: string): { item: T }[] {
		return this._fuze.search(t) as { item: T; score?: number }[];
	}
}
