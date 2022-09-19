import { StringCompressor } from './string-compressor';
import type { CheckList } from '../types';

export const getDecodeLinkToList = (list: CheckList): string => {
	const compressed = new StringCompressor().compressToEncodedURIComponent(JSON.stringify(list));
	return window.origin + '/decode/' + compressed;
};
