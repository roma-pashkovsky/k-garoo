export class StringCompressor {
	private lzString: any;

	constructor() {
		this.lzString = (window as any)?.LZString as any;
	}

	public compressToEncodedURIComponent(source: string): string {
		return this.lzString.compressToEncodedURIComponent(source);
	}

	public decompressFromEncodedURIComponent(source: string): string {
		return this.lzString.decompressFromEncodedURIComponent(source);
	}
}
