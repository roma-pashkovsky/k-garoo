<script lang="ts">
	import { swipe } from 'svelte-gestures';
	import { createEventDispatcher, onMount } from 'svelte';
	import { Button, Card, DropdownItem } from 'flowbite-svelte';
	import DotMenu from '../DotMenu.svelte';
	import { DocumentRemove } from 'svelte-heros';
	import { Link } from 'svelte-heros-v2';
	import { t } from '../../stores/app/translate';
	import ListCardPreview from '../ListCardPreview.svelte';
	import type { CheckList } from '../../types';
	import { writable } from 'svelte/store';
	import type { Readable } from 'svelte/store';
	import { getList } from '../../stores/checklist-details/checklist-details-data';
	import UsersByListMini from '../UsersByListMini.svelte';
	import type { AppUser } from '../../types/auth';

	export let listId: string;

	const dispatch = createEventDispatcher();
	let card = writable<CheckList | null>(null);
	let users: Readable<AppUser[]>;
	let isDraggable = false;

	onMount(async () => {
		const list = await getList(listId, true);
		card.set(list);
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

	function onDragHandleMouseDown(): void {
		isDraggable = true;
	}

	function onDragHandleMouseUp(): void {
		isDraggable = false;
	}
</script>

<div
	use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-left pan-y' }}
	on:swipe={() => onListRemove(card.id)}
	on:click={() => onCardClicked(card.id)}
	draggable={isDraggable}
	on:drag
>
	<Card
		class="!pl-6 !pt-6 !pb-6 !pr-10 !shadow-sm hover:bg-gray-50 cursor-pointer w-72 sm:w-80 relative"
	>
		<div style="min-height: 112px;">
			{#if $card}
				<div
					class="drag-handle absolute top-1 left-1 w-8 h-8"
					on:mousedown|stopPropagation|preventDefault={onDragHandleMouseDown}
					on:mouseup|stopPropagation|preventDefault={onDragHandleMouseUp}
				>
					D
				</div>
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
				<ListCardPreview list={$card} />
				<div class="absolute" style="bottom: 0.5rem; right: 0.3rem">
					<UsersByListMini bind:users listId={$card.id} />
				</div>
			{/if}
		</div>
	</Card>
</div>

<style>
</style>
