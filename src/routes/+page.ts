import type { PageServerLoad } from './$types';
import { isAuthed } from '../utils/is-authed';

export const load: PageServerLoad = async ({ params }) => {
	return isAuthed().then((isAuthed) => {
		return {
			isAuthed
		};
	});
};
