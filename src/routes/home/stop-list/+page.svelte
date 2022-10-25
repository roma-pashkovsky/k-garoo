<script lang="ts">
	import Page from '../../../lib/Page.svelte';
	import BlockedUserCard from './BlockedUserCard.svelte';
	import { stopListUsers } from '../../../stores/stop-list/stop-list.store';
	import PageTitle from '../../../lib/PageTitle.svelte';
	import { t } from '../../../stores/app/translate.js';
	import EmptyPage from '../../../lib/EmptyPage.svelte';
</script>

<Page>
	<PageTitle>
		{$t('stop-list.page.title')}
	</PageTitle>
	{#if !$stopListUsers?.length}
		<EmptyPage>
			{$t('stop-list.page.empty')}
		</EmptyPage>
	{/if}
	{#each $stopListUsers as user}
		<BlockedUserCard {user} />
	{/each}
</Page>
