import { getCookieValue } from '../get-cookie-value';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { verifySessionCookie } from './firebase-admin-utils';

export const getUserFromRequest = async (req: Request): Promise<DecodedIdToken | null> => {
	try {
		const cookies = req.headers.get('cookie');
		const session = getCookieValue('session', cookies);
		if (session) {
			return await verifySessionCookie(session);
		} else {
			return null;
		}
	} catch (err) {
		console.log('Error getting user: ', err);
		return null;
	}
};
