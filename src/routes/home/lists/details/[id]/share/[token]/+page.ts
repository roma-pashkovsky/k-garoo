import type { LoadEvent } from '@sveltejs/kit';
import type { SharedListTokenLoadData } from './shared-list-token-load-data';
import { ShareListStore } from '../../../../../../../stores/share-list/share-list.store';
import type { AppUser } from '../../../../../../../types/auth';

export async function load(event: LoadEvent): Promise<SharedListTokenLoadData> {
	const params = event.params;
	const verifyResp = await new ShareListStore()
		.verifyShareListInviteToken(params.id as string, params.token as string, event.fetch)
		.catch((err) => null);
	return {
		token: { verified: !!verifyResp, user: verifyResp as AppUser, value: params.token as string }
	};
}
