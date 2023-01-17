export const invalidAuth = () =>
	new Response(JSON.stringify({ error: 'Invalid auth' }), { status: 401 });

export const badRequest = (msg?: string) =>
	new Response(JSON.stringify({ error: msg || 'Bad request' }), { status: 400 });

export const notYourResource = (msg?: string) =>
	new Response(JSON.stringify({ error: msg || 'Bad request' }), { status: 403 });

export const serverError = () =>
	new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });

export const ok = () => new Response(JSON.stringify({ status: 'OK' }), { status: 200 });
