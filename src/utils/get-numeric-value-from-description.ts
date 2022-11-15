export const getNumericValueFromDescription = (desc: string): number => {
	if (!desc.length) {
		return 0;
	}
	let result = '';
	let wasInsideTheNumber = false;
	for (let i = desc.length - 1; i >= 0; i--) {
		if (wasInsideTheNumber) {
			break;
		}
		if (/\d/.test(desc[i])) {
			result = desc[i] + result;
			wasInsideTheNumber = true;
			for (let j = i - 1; j >= 0; j--) {
				if (/[0-9.,' ]/.test(desc[j])) {
					result = desc[j] + result;
				} else {
					break;
				}
			}
		}
	}
	result = result.replaceAll(/[' ]/g, '');
	console.log(result);
	if (result?.length) {
		return parseFloat(result);
	} else {
		return 0;
	}
};
