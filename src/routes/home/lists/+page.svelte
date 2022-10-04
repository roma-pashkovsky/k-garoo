<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { Plus } from 'svelte-heros';
	import { goto } from '$app/navigation';
	import { locale, t, translate } from '../../../utils/i18n';
	import type { CheckList } from '../../../types';
	import EmptyPage from '../../../lib/EmptyPage.svelte';
	import Page from '../../../lib/Page.svelte';
	import { getDecodeLinkToList } from '../../../utils/get-decode-link-to-list';
	import { copyToClipboard } from '../../../utils/copy-to-clipboard';
	import { ToastService } from '../../../utils/toasts';
	import { getUID } from '../../../utils/get-uid';
	import ListCardChecklist from '../../../lib/main-list/ListCardChecklist.svelte';
	import { ChecklistMainListStore } from '../../../stores/checklist-main-list/checklist-main-list-store';
	import { onDestroy, onMount } from 'svelte';

	const toastManager = ToastService.getInstance();
	const store = new ChecklistMainListStore();
	const items = ChecklistMainListStore.items;

	onMount(() => {
		store.init();
	});

	onDestroy(() => {
		store.destroy();
	});

	function onListRemove(listId: string, list: CheckList): void {
		if (confirm(translate($locale, 'lists.remove-warning', { list: list.name }))) {
			store.removeList(listId);
		}
	}

	async function onListGetLink(list: CheckList): Promise<void> {
		const url = getDecodeLinkToList(list);
		await copyToClipboard(url);
		toastManager.push({
			text: ($t as any)('lists.details.link-created'),
			closePrevious: false
		});
	}

	export function onCardClicked(id: string): void {
		goto(`/list-details/${id}`);
	}

	export function onAddButtonClicked(): void {
		const listId = getUID();
		goto(`/list-details/${listId}`);
	}
</script>

<svelte:head>
	<title>K-garoo - {$t('app.my_lists')}</title>
</svelte:head>

<div class="absolute top-2 right-2 p-2 z-10">
	<Button on:click={onAddButtonClicked} class="!p-2 shadow-md"><Plus class="w-6 h-6" /></Button>
</div>
<Page>
	<div class="flex items-start justify-center" style="padding-top: 4rem">
		{#if !$items?.length}
			<EmptyPage class="pt-6">
				{$t('lists.no_lists')}
				<br />
				{@html $t('lists.no_lists_cta_1')}
				<span class="underline cursor-pointer" on:click={onAddButtonClicked}
					>{$t('lists.no_lists_cta_link')}</span
				>
			</EmptyPage>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			{#each $items as id (id)}
				<ListCardChecklist
					listId={id}
					on:remove={(event) => onListRemove(id, event.detail.card)}
					on:card-click={() => onCardClicked(id)}
					on:get-link={(event) => onListGetLink(event.detail.card)}
				/>
			{/each}
		</div>
	</div>
</Page>
