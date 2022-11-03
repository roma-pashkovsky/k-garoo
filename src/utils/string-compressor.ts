let lzString: any;

export const resolveLZString = () => {
	console.log('resolving lz string');
	const limit = 10000;
	const start = new Date().getTime();
	let handle: any;
	const fn = () => {
		handle = setTimeout(() => {
			lzString = (window as any)?.LZString as any;
			const elapsed = new Date().getTime() - start;
			if (lzString || elapsed > limit) {
				if (lzString) {
					console.log('resolved lz-string');
				}
				clearTimeout(handle);
			} else {
				fn();
			}
		}, 200);
	};
	fn();
};

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
		return lzString.decompressFromEncodedURIComponent(source);
	}
}
