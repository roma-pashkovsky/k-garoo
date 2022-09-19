<script lang="ts">
	import { Card, Button, Spinner, DropdownItem } from 'flowbite-svelte';
	import { DocumentRemove, Plus } from 'svelte-heros';
	import { goto } from '$app/navigation';
	import { getState, setState } from '../../../utils/local-storage-state';
	import { locale, t, translate } from '../../../utils/i18n';
	import type { KGarooState, CheckList } from '../../../types';
	import EmptyPage from '../../../lib/EmptyPage.svelte';
	import { swipe } from 'svelte-gestures';
	import Page from '../../../lib/Page.svelte';
	import NavBar from '../../../lib/NavBar.svelte';
	import DotMenu from '../../../lib/DotMenu.svelte';
	import AppDivInput from '../../../lib/AppDivInput.svelte';
	import { getDecodeLinkToList } from '../../../utils/get-decode-link-to-list';
	import { copyToClipboard } from '../../../utils/copy-to-clipboard';
	import { ToastService } from '../../../utils/toasts';
	import { Link } from 'svelte-heros-v2';

	const state: KGarooState = getState();
	let ids = state.listIds || [];
	const data = state.listData || {};
	const toastManager = ToastService.getInstance();
	$: cards = ids.map((id) => data[id]) as CheckList[];

	function onListRemove(listId: string): void {
		const list = data[listId];
		if (confirm(translate($locale, 'lists.remove-warning', { list: list.name }))) {
			ids = ids.filter((id) => id !== list.id);
			delete data[list.id];
			setState({
				...state,
				listIds: ids,
				listData: data
			});
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
		goto('/list-details/create');
	}
</script>

<svelte:head>
	<title>K-garoo - {$t('app.my_lists')}</title>
</svelte:head>

<div class="absolute top-2 right-2 z-10 p-2">
	<Button on:click={onAddButtonClicked} class="!p-2 shadow-md"><Plus class="w-8 h-8" /></Button>
</div>
<Page>
	<div class="flex items-start justify-center" style="padding-top: 4rem">
		{#if !cards?.length}
			<EmptyPage class="pt-6">
				{$t('lists.no_lists')}
				<br />
				{@html $t('lists.no_lists_cta_1')}
				<a class="underline cursor-pointer" href="/list-details/create"
					>{$t('lists.no_lists_cta_link')}</a
				>
			</EmptyPage>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each cards as card, index}
				<div
					use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-left pan-y' }}
					on:swipe={() => onListRemove(card.id)}
					on:click={() => onCardClicked(card.id)}
				>
					<Card
						class="!pl-6 !pt-6 !pb-6 !pr-10 hover:bg-gray-50 cursor-pointer w-56 sm:w-80 relative"
					>
						<div class="absolute top-1 right-1" onclick="event.stopPropagation()">
							<DotMenu id={'item' + index}>
								<DropdownItem>
									<div class="flex items-center" on:click={() => onListRemove(card.id)}>
										<Button class="!p-2 mr-2" color="light">
											<DocumentRemove size="15" />
										</Button>
										{$t('lists.remove-list')}
									</div>
								</DropdownItem>
								<DropdownItem>
									<div class="flex items-center" on:click={() => onListGetLink(card)}>
										<Button class="!p-2 mr-2" color="light">
											<Link size="15" />
										</Button>
										{$t('lists.details.link-to-list')}
									</div>
								</DropdownItem>
							</DotMenu>
						</div>
						<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">
							{card.name}
						</h5>
						<div class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
							<ul>
								{#if card?.items?.length}
									<div>
										<li class="mb-1 {card.items[0]?.checked ? 'checked' : ''}">
											{card.items[0].itemDescription}
										</li>
									</div>
								{/if}
								{#if card?.items?.length > 1}
									<li class={card.items[1]?.checked ? 'checked' : ''}>
										{card.items[1].itemDescription}
									</li>
								{/if}
							</ul>
						</div>
					</Card>
				</div>
			{/each}
		</div>
	</div>
</Page>

<style>
	.checked {
		position: relative;
		display: inline-block;
		text-decoration: line-through;
	}
</style>
