import { DEFAULT_DELAY, setPointerControls } from './shared';

export function customPress(
	node: HTMLElement,
	parameters: { delay?: number; timeframe?: number; triggerBeforeFinished?: boolean }
): { destroy: () => void } {
	// listen for the long-press event
	return {
		destroy: () => {}
	};
}
