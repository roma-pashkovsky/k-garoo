export function objectValues<T>(source: T): T[keyof T][] {
	return Object.keys(source as any).map((key) => (source as any)[key]);
}
