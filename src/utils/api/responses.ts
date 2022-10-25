export const invalidAuth = () =>
	new Response(JSON.stringify({ error: 'Invalid auth' }), { status: 401 });

export const serverError = () =>
	new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });

export const ok = () => new Response(JSON.stringify({ status: 'OK' }), { status: 200 });
