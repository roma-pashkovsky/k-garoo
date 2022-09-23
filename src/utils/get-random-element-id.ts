const letters = 'qwertyuiopasdfghjklzxcvbnm';
const l = letters.length;

export const getRandomElementId = (len: number): string => {
	let t = '';
	let i = 0;
	while (i++ < len) {
		t += letters.charAt(Math.floor(Math.random() * l));
	}
	return t;
};
