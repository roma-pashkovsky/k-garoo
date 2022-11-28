import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import {
	createSessionCookie,
	existsAdmin,
	setAdmin,
	verifyIdToken
} from '../../../../utils/api/firebase-admin-utils';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { userPath } from '../../../../utils/api/db-paths';
import { serverError } from '../../../../utils/api/responses';
import { UserSearchManager } from '../../../../utils/api/user-search-manager';

const WEEK_SECONDS = 60 * 60 * 24 * 12;

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader) {
		return new Response('Invalid', { status: 401, statusText: 'Invalid credentials' });
	}
	const [scheme, token] = authHeader.split(' ');
	if (scheme !== 'Bearer' || !token) {
		return new Response('Invalid', { status: 401, statusText: 'Invalid credentials' });
	}
	const { uid: id, email } = await verifyIdToken(token);
	const user = await request.json();
	const isExisting = await existsAdmin(userPath(id));
	if (!isExisting) {
		await setAdmin([
			{
				path: userPath(id),
				value: user
			}
		]);
	}
	const cookie = await createSessionCookie(token, WEEK_SECONDS);
	return new Response(JSON.stringify({ user: { id, email } }), {
		headers: {
			'Set-Cookie': cookie
		}
	});
};

export const DELETE: RequestHandler = async (): Promise<Response> => {
	return new Response('ok', {
		headers: {
			'Set-Cookie': `session=; SameSite=Strict; Path=/; Secure; HttpOnly; Max-Age=0; Expires=${new Date(
				0
			).toUTCString()}`
		}
	});
};

export const GET: RequestHandler = async ({ request }): Promise<Response> => {
	try {
		const user = await getUserFromRequest(request);
		if (!user) {
			return json(null);
		}
		const userDb = await UserSearchManager.getUser(user.uid);
		return json(userDb);
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
