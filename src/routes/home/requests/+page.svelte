<script lang="ts">
	import Page from '../../../lib/Page.svelte';
	import SharedListCard from '../../../lib/SharedListCard.svelte';
	import { sharedListIds } from '../../../stores/my-shared-lists/my-shared-list.store';
	import EmptyPage from '../../../lib/EmptyPage.svelte';
	import { t } from '../../../stores/app/translate.js';
	import PageTitle from '../../../lib/PageTitle.svelte';
	import { goto } from '$app/navigation';

	function goHome(): void {
		goto('/home/lists');
	}
</script>

<Page>
	<PageTitle backButton={true} on:back-clicked={goHome}>
		{$t('share-list.requests.title')}
	</PageTitle>
	<div class="flex items-start justify-center">
		{#if !$sharedListIds?.length}
			<EmptyPage>{$t('share-list.requests.empty')}</EmptyPage>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			{#each $sharedListIds as listId}
				<SharedListCard {listId} />
			{/each}
		</div>
	</div>
</Page>
