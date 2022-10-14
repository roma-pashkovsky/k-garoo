<script lang="ts">
	import { Plus } from 'svelte-heros';
	import { goto } from '$app/navigation';
	import type { CheckList } from '../../../types';
	import EmptyPage from '../../../lib/EmptyPage.svelte';
	import Page from '../../../lib/Page.svelte';
	import { getDecodeLinkToList } from '../../../utils/get-decode-link-to-list';
	import { copyToClipboard } from '../../../utils/copy-to-clipboard';
	import { ToastService } from '../../../utils/toasts';
	import { getUID } from '../../../utils/get-uid';
	import ListCardChecklist from '../../../lib/main-list/ListCardChecklist.svelte';
	import { ChecklistMainListStore } from '../../../stores/checklist-main-list/checklist-main-list-store';
	import { onDestroy } from 'svelte';
	import { doubleTap } from '../../../utils/double-tap';
	import { t } from '../../../stores/app/translate';
	import { get } from 'svelte/store';

	const toastManager = ToastService.getInstance();
	export let data;
	const store: ChecklistMainListStore = data.store;
	const items = ChecklistMainListStore.items;

	onDestroy(() => {
		store?.destroy();
	});

	function onListRemove(listId: string, list: CheckList): void {
		if (confirm(get(t)('lists.remove-warning', { list: list.name }))) {
			store.removeList(listId);
		}
	}

	async function onListGetLink(list: CheckList): Promise<void> {
		const url = getDecodeLinkToList(list);
		await copyToClipboard(url);
		toastManager.push({
			text: get(t)('lists.details.link-created'),
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

<div class="hidden md:block absolute top-8 right-8 z-10">
	<button
		use:doubleTap
		on:tap={onAddButtonClicked}
		class="text-center font-medium focus:ring-4 inline-flex items-center justify-center px-5 py-2.5 text-sm text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 rounded-lg !p-2 shadow-md"
		><Plus class="w-7 h-7" /></button
	>
</div>
<div class="block md:hidden absolute bottom-4 right-4 p-2 z-10">
	<button
		use:doubleTap
		on:tap={onAddButtonClicked}
		class="text-center font-medium focus:ring-4 inline-flex items-center justify-center px-5 py-2.5 text-sm text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 rounded-lg !p-2 shadow-md"
		><Plus class="w-7 h-7" /></button
	>
</div>
<Page>
	<div class="flex items-start justify-center">
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
