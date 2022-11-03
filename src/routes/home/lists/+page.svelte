<script lang="ts">
	import { goto } from '$app/navigation';
	import type { CheckList } from '../../../types';
	import EmptyPage from '../../../lib/EmptyPage.svelte';
	import { getDecodeLinkToList } from '../../../utils/get-decode-link-to-list';
	import { ToastService } from '../../../utils/toasts';
	import ListCardChecklist from '../../../lib/main-list/ListCardChecklist.svelte';
	import {
		items,
		removeList,
		reorderList
	} from '../../../stores/checklist-main-list/checklist-main-list-store';
	import { t } from '../../../stores/app/translate';
	import { get } from 'svelte/store';
	import { getUID } from '../../../utils/get-uid';
	import Page from '../../../lib/Page.svelte';
	import { Plus } from 'svelte-heros-v2';
	import { doubleTap } from '../../../utils/double-tap';
	import { page } from '$app/stores';

	const toastManager = ToastService.getInstance();
	const url = 'https://www.garoo.fun/home/lists';

	let draggingItemId: string | null = null;
	let hoverItemId: string | null = null;
	let lastVisitedId: string | null = $page?.url?.searchParams?.get('lastVisitedId');

	function onListRemove(listId: string, list: CheckList): void {
		if (confirm(get(t)('lists.remove-warning', { list: list.name }))) {
			removeList(listId);
		}
	}

	async function onListGetLink(list: CheckList): Promise<void> {
		const url = getDecodeLinkToList(list);
		try {
			await navigator.clipboard.writeText(url);
			toastManager.push({
				text: get(t)('lists.details.link-created'),
				closePrevious: false
			});
		} catch (err) {
			console.error(err);
			toastManager.push({
				text: 'Failed to copy url',
				color: 'warning'
			});
		}
	}

	function onCardClicked(id: string): void {
		goto(`/list-details/${id}`);
	}

	function onAddButtonClicked() {
		const id = getUID();
		goto(`/list-details/${id}`);
	}

	function onDragItemDropped(): void {
		const currList = get(items);
		const hoverItemIndex = currList.findIndex(({ id }) => id === hoverItemId);
		const dragItemIndex = currList.findIndex(({ id }) => id === draggingItemId);
		if (hoverItemIndex === undefined || dragItemIndex === undefined) {
			return;
		}
		const temp = currList[hoverItemIndex];
		currList[hoverItemIndex] = currList[dragItemIndex];
		currList[dragItemIndex] = temp;
		reorderList(currList);
		draggingItemId = null;
		hoverItemId = null;
	}
</script>

<svelte:head>
	<title>Garoo - {$t('app.my_lists')}</title>
	<meta property="og:type" content="article" />
	<meta property="og:url" content={url} />
	<meta property="og:site_name" content="Garoo" />
	<meta property="og:description" content={$t('app.logo')} />
	<meta property="og:title" content={$t('app.my_lists')} />
	<meta property="og:image" content="https://www.garoo.fun/img/thumb.jpg" />
	<meta property="og:image:secure_url" content="https://www.garoo.fun/img/thumb.jpg" />
	<meta property="og:image:width" content="200" />
	<meta property="og:image:height" content="200" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:description" content={$t('app.logo')} />
	<meta name="twitter:site" content="@business" />
	<meta name="twitter:title" content={$t('app.my_lists')} />
	<meta name="twitter:image" content="https://www.garoo.fun/img/thumb.jpg" />
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
			{#each $items as item (item.id)}
				<ListCardChecklist
					listItem={item}
					{draggingItemId}
					{hoverItemId}
					{lastVisitedId}
					on:remove={(event) => onListRemove(item.id, event.detail.card)}
					on:card-click={() => onCardClicked(item.id)}
					on:get-link={(event) => onListGetLink(event.detail.card)}
					on:dragstart={() => {
						draggingItemId = item.id;
					}}
					on:dragover={() => (hoverItemId = item.id)}
					on:dragend={() => {
						draggingItemId = null;
						hoverItemId = null;
					}}
					on:drop={onDragItemDropped}
				/>
			{/each}
		</div>
	</div>
</Page>
