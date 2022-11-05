import * as LZString from 'lz-string';

const lzString = LZString;

export class StringCompressor {
	public compressToEncodedURIComponent(source: string): string {
		if (!lzString) {
			console.warn('No lzstring');
		}
		return lzString.compressToEncodedURIComponent(source);
	}

	public decompressFromEncodedURIComponent(source: string): string {
		if (!lzString) {
			console.warn('No lzstring');
		}
		return lzString.decompressFromEncodedURIComponent(source) as string;
	}
}
