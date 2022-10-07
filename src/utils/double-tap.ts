import { doubleTapHandler } from './double-tap-handler';

export function doubleTap(node: HTMLElement) {
	const speed = 500;
	const distance = 40;
	const event = 'ontouchend' in node ? 'touchend' : 'mouseup';
	const handler = doubleTapHandler(speed, distance);
	node.addEventListener(event, handler, false);
	return {
		destroy() {
			node.removeEventListener(event, handler, true);
		}
	};
}
