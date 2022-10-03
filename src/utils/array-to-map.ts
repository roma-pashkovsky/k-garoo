export function arrayToMap<T>(arr: T[], idKey: keyof T): { [id: string]: T } {
	return arr.reduce((p, c) => ({ ...p, [c[idKey] as string]: c }), {});
}
