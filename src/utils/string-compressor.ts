export class StringCompressor {
	private lzString = (window as any).LZString as any;

	constructor() {
		if (!(window as any).LZString) {
			console.warn('no lz string found');
		}
	}

	public compressToEncodedURIComponent(source: string): string {
		return this.lzString.compressToEncodedURIComponent(source);
	}

	public decompressFromEncodedURIComponent(source: string): string {
		return this.lzString.decompressFromEncodedURIComponent(source);
	}
}
