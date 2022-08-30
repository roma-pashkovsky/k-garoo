import type {PageServerLoad} from './$types'


export const load: PageServerLoad = async ({ params }) => {
    return isAuthed()
        .then(isAuthed => {
            return {
                isAuthed
            }
        });
}

async function isAuthed(): Promise<boolean> {
    return Promise.resolve(false);
}
