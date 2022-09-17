export function applyIf(node: any, cl: any, condition: boolean) {
	condition && cl(node);
	return {
		update(updatedCl: any, updatedCondition: boolean) {
			updatedCondition && updatedCl(node);
		}
	};
}
