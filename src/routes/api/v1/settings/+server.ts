import type { RequestHandler } from '@sveltejs/kit';
import { serverError } from '../../../../utils/api/responses';
import { getCookieValue } from '../../../../utils/get-cookie-value';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	try {
		const settings = await request.json();
		const encoded = JSON.stringify(settings);
		console.log(encoded);
		const buff = Buffer.from(encoded, 'ascii');
		const base64data = buff.toString('base64');
		return new Response(JSON.stringify({ status: 'ok' }), {
			headers: {
				'Set-Cookie': `settings=${base64data}; SameSite=Strict; path=/; Secure; HttpOnly;`
			}
		});
	} catch (err) {
		return serverError();
	}
};

export const DELETE: RequestHandler = async (): Promise<Response> => {
	try {
		return new Response(JSON.stringify({ status: 'ok' }), {
			headers: { 'Set-Cookie': `settings=; SameSite=Strict; path=/; Secure; HttpOnly; Max-Age=0` }
		});
	} catch (err) {
		return serverError();
	}
};

export const GET: RequestHandler = async ({ request }): Promise<Response> => {
	try {
		const cookie = request.headers.get('cookie');
		const settings = getCookieValue('settings', cookie);
		if (!settings) {
			return json(null);
		} else {
			const buff = Buffer.from(settings, 'base64');
			const text = buff.toString('ascii');
			return json(JSON.parse(text));
		}
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
