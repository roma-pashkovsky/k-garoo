export const stopMouseEvent = (event: MouseEvent) => {
	event.stopPropagation();
	event.preventDefault();
};
