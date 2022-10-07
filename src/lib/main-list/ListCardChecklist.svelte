<script lang="ts">
	import { swipe } from 'svelte-gestures';
	import { createEventDispatcher, onMount } from 'svelte';
	import { ChecklistMainListItemStore } from '../../stores/checklist-main-list/checklist-main-list-item-store';
	import { Button, Card, DropdownItem } from 'flowbite-svelte';
	import DotMenu from '../DotMenu.svelte';
	import { DocumentRemove } from 'svelte-heros';
	import { Link } from 'svelte-heros-v2';
	import { t } from '../../stores/app/translate';

	export let listId: string;

	const dispatch = createEventDispatcher();
	const store = new ChecklistMainListItemStore();
	const card = store.checklist;

	onMount(() => {
		store.init(listId);
	});

	function onListRemove(id: string) {
		dispatch('remove', { card: $card });
	}

	function onCardClicked(id: string) {
		dispatch('card-click');
	}

	function onListGetLink() {
		dispatch('get-link', { card: $card });
	}
</script>

<div
	use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-left pan-y' }}
	on:swipe={() => onListRemove(card.id)}
	on:click={() => onCardClicked(card.id)}
>
	<Card
		class="!pl-6 !pt-6 !pb-6 !pr-10 !shadow-sm hover:bg-gray-50 cursor-pointer w-64 sm:w-80 relative h-32"
	>
		{#if $card}
			<div class="absolute top-1 right-1" onclick="event.stopPropagation()">
				<DotMenu>
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
			<h5
				class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis"
				style="min-height: 30px"
			>
				{$card.name}
			</h5>
			<div class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
				<ul>
					{#if $card.items?.length}
						<div>
							<li
								class="mb-1 whitespace-nowrap overflow-hidden text-ellipsis {$card.items[0]?.checked
									? 'checked'
									: ''}"
							>
								{$card.items[0].itemDescription}
							</li>
						</div>
					{/if}
					{#if $card.items?.length > 1}
						<li
							class="whitespace-nowrap overflow-hidden text-ellipsis {$card.items[1]?.checked
								? 'checked'
								: ''}"
						>
							{$card.items[1].itemDescription}
						</li>
					{/if}
				</ul>
			</div>
		{/if}
	</Card>
</div>

<style>
	.checked {
		position: relative;
		display: inline-block;
		text-decoration: line-through;
	}
</style>
