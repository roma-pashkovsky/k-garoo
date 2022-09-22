export function hammerPress(node: HTMLElement): any {
	const manager = new (window as any).Hammer(node);
	manager.on('press', () => {
		node.dispatchEvent(new CustomEvent('hammerPress'));
	});
	node.oncontextmenu = (e) => {
		e.preventDefault();
	};
	return {
		destroy() {
			manager.destroy();
		}
	};
}
