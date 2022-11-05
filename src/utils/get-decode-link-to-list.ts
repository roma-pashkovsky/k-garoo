import { StringCompressor } from './string-compressor';
import type { CheckList, ChecklistWithSettings } from '../types';

export const getDecodeLinkToList = (list: ChecklistWithSettings): string => {
	const compressed = new StringCompressor().compressToEncodedURIComponent(JSON.stringify(list));
	return window.origin + '/decode/' + compressed;
};
