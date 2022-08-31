<script lang="ts">
	import { Card, Button } from 'flowbite-svelte';
	import { Plus } from 'svelte-heros';
	import { goto } from '$app/navigation';
	import { getState } from '../../../utils/local-storage-state';
	import type { KGarooState, CheckList } from '../../../types';
	import EmptyPage from '../../../lib/EmptyPage.svelte';

	const state: KGarooState = getState();
	const ids = state.listIds || [];
	const data = state.listData || [];
	$: cards = ids.map((id) => data[id]) as CheckList[];

	export function onAddButtonClicked(): void {
		goto('/home/lists/create');
	}
</script>

<div class="p-8">
	<Button on:click={onAddButtonClicked} class="!p-2" o><Plus class="w-8 h-8" /></Button>
</div>
<div class="min-h-screen flex items-start justify-center">
	{#if !cards?.length}
		<EmptyPage>
			No lists. Let's <a class="underline cursor-pointer" href="/home/lists/create">add one</a>
		</EmptyPage>
	{/if}
	<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
		{#each cards as card}
			<Card href="lists/{card.id}">
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
			</Card>
		{/each}
	</div>
</div>

<style>
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
