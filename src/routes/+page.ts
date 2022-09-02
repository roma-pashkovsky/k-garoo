import type { PageLoad } from './$types';
import { isAuthed } from '../utils/is-authed';

export const load: PageLoad = async ({ params }) => {
	return isAuthed().then((isAuthed) => {
		return {
			isAuthed
		};
	});
};
