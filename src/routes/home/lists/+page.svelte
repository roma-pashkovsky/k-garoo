<script lang="ts">
	import { Card, Button } from 'flowbite-svelte';
	import { DocumentRemove, Plus } from 'svelte-heros';
	import { goto } from '$app/navigation';
	import { getState, setState } from '../../../utils/local-storage-state';
	import { locale, t, translate } from '../../../utils/i18n';
	import type { KGarooState, CheckList } from '../../../types';
	import EmptyPage from '../../../lib/EmptyPage.svelte';
	import { swipe } from 'svelte-gestures';

	const state: KGarooState = getState();
	let ids = state.listIds || [];
	const data = state.listData || {};
	$: cards = ids.map((id) => data[id]) as CheckList[];

	function onListRemove(list: CheckList): void {
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

	export function onCardClicked(id: string): void {
		goto(`/home/lists/${id}`);
	}

	export function onAddButtonClicked(): void {
		goto('/home/lists/create');
	}
</script>

<svelte:head>
	<title>K-garoo - {$t('app.my_lists')}</title>
</svelte:head>

<div class="p-8">
	<Button on:click={onAddButtonClicked} class="!p-2" o><Plus class="w-8 h-8" /></Button>
</div>
<div class="min-h-screen flex items-start justify-center">
	{#if !cards?.length}
		<EmptyPage>
			{$t('lists.no_lists')}
			{$t('lists.no_lists_cta_1')}
			<a class="underline cursor-pointer" href="/home/lists/create"
				>{$t('lists.no_lists_cta_link')}</a
			>
		</EmptyPage>
	{/if}
	<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
		{#each cards as card}
			<div
				use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-left pan-y' }}
				on:swipe={() => onListRemove(card)}
				on:click={() => onCardClicked(card.id)}
			>
				<Card class="!p-0">
					<div class="card-container">
						<div class="list-details">
							<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
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
						</div>
						<div onclick="event.stopPropagation()" class="list-actions p-1 ml-3">
							<Button on:click={() => onListRemove(card)} class="!p-2" color="light">
								<DocumentRemove />
							</Button>
						</div>
					</div>
				</Card>
			</div>
		{/each}
	</div>
</div>

<style>
	.card-container {
		display: flex;
		min-width: 180px;
		min-height: 85px;
		box-sizing: border-box;
		padding: 2rem 0.8rem;
	}

	.list-details {
		flex: 1;
		cursor: pointer;
	}
	.checked {
		position: relative;
		display: inline-block;
	}

	.checked:before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: 11px;
		border-bottom: 1px solid black;
	}
</style>
