export enum Keycodes {
	ENTER = 13,
	ARROW_DOWN = 40,
	ARROW_UP = 38
}

export const isEnter = (event: KeyboardEvent): boolean => {
	return (
		event.keyCode === Keycodes.ENTER ||
		event.key === 'Enter' ||
		event.code === 'Enter' ||
		(event as any as InputEvent).inputType === 'insertParagraph'
	);
};
