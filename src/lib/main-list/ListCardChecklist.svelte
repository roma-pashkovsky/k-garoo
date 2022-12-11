<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Badge, Button, Card, DropdownItem } from 'flowbite-svelte';
	import DotMenu from '../DotMenu.svelte';
	import { ArrowDown, ArrowLeft, ArrowsUpDown, DocumentMinus, Link, Share } from 'svelte-heros-v2';
	import { t } from '../../stores/app/translate';
	import ListCardPreview from '../ListCardPreview.svelte';
	import type { MainListItem } from '../../types';
	import { derived } from 'svelte/store';
	import { loadList, listDataStore } from '../../stores/checklist-details/checklist-details-data';
	import UsersByListMini from '../UsersByListMini.svelte';
	import { slide } from 'svelte/transition';
	import { stopMouseEvent } from '../../utils/stop-mouse-event.js';
	import { AuthStore } from '../../stores/login/auth.store';
	import { shareList } from '../../stores/app/share-list-drawer.store';

	export let index: number;
	export let movedIndex: number;
	export let listItem: MainListItem;
	export let lastVisitedId: string | null;
	export let draggingItemId: string | null;
	export let hoverItemId: string | null;

	let listId: string = listItem?.id;
	let listName: string | null = listItem?.name;
	let cardDiv: HTMLDivElement;
	const dispatch = createEventDispatcher();
	let card = derived(listDataStore, ($listDataStore) => {
		return $listDataStore[listId];
	});
	let dotMenuOpen: boolean;
	const isShareEnabled = AuthStore.isLoggedIn;
	$: isDraggedOver = hoverItemId === listId;
	$: isDragged = draggingItemId === listId;
	$: isLastVisited = lastVisitedId === listId;
	$: isMoving = movedIndex >= 0;
	$: isMovingMe = movedIndex === index;
	$: isFirst = index === 0;
	$: isMovedAfterMe = movedIndex === index + 1;

	onMount(async () => {
		listId = listItem?.id;
		listName = listItem?.name || null;
		if (lastVisitedId === listId && !!cardDiv) {
			cardDiv.scrollIntoView({ block: 'center' });
		}
		loadList(listId, true);
	});

	function onListRemove() {
		dispatch('remove', { card: $card });
	}

	function onListMove() {
		dotMenuOpen = false;
		dispatch('move');
	}

	function onCardClicked() {
		dispatch('card-click');
	}

	function onListGetLink() {
		dispatch('get-link', { card: $card });
	}

	function onInsertAfter() {
		dispatch('insert-after');
	}

	function onInsertBefore() {
		dispatch('insert-before');
	}

	function onShareClicked() {
		shareList(listId);
	}

	function onShareClickedNoAuth() {
		AuthStore.triggerLoginClicked();
	}
</script>

{#if isDraggedOver && !isDragged}
	<div
		class="overflow-hidden"
		ondragover="event.preventDefault()"
		ondragenter="event.preventDefault()"
		on:drop
		in:slide
	>
		<Card
			class="!pl-6 !pt-6 !pb-6 !pr-10 !shadow-sm hover:bg-gray-50 cursor-pointer w-72 lg:w-80 relative"
		>
			<div style="min-height: 112px;" />
		</Card>
	</div>
{/if}
<div
	bind:this={cardDiv}
	on:swiped-left={() => onListRemove()}
	on:click={() => onCardClicked()}
	draggable="true"
	on:dragstart
	on:drag
	on:dragend
	on:dragover
>
	<Card
		class="!pl-6 !pt-6 !pb-6 !pr-10 !shadow-sm hover:bg-gray-50 cursor-pointer w-72 lg:w-80 relative {isLastVisited
			? 'bg-gray-100 dark:bg-gray-700'
			: ''} {isMovingMe ? '!border-blue-600' : ''}"
	>
		<div style="min-height: 112px;">
			<div class="absolute top-1 right-1" onclick="event.stopPropagation()">
				<DotMenu bind:open={dotMenuOpen} widthClass="w-56">
					<DropdownItem>
						<div class="flex items-center" on:click={onListMove}>
							<Button class="!p-2 mr-2" color="light">
								<ArrowsUpDown size="15" />
							</Button>
							{$t('list.move.menu')}
						</div>
					</DropdownItem>
					<DropdownItem>
						{#if $isShareEnabled}
							<div on:click={onShareClicked} class="w-full flex items-center">
								<Button class="!p-2 mr-2" color="light">
									<Share size="15" />
								</Button>
								{$t('lists.details.share-list')}
							</div>
						{:else}
							<div on:click={onShareClickedNoAuth} class="w-full flex items-center">
								<Button class="!p-2 mr-2" color="light">
									<Share size="15" />
								</Button>
								<div class="whitespace-nowrap">
									{$t('lists.details.share-list')}
									<Badge color="purple" class="ml-2">
										{$t('lists.details.share-list-login')}
									</Badge>
								</div>
							</div>
						{/if}
					</DropdownItem>
					<DropdownItem>
						<div class="flex items-center" on:click={() => onListGetLink()}>
							<Button class="!p-2 mr-2" color="light">
								<Link size="15" />
							</Button>
							{$t('lists.details.link-to-list')}
						</div>
					</DropdownItem>
					<DropdownItem>
						<div class="flex items-center" on:click={() => onListRemove()}>
							<Button class="!p-2 mr-2" color="light">
								<DocumentMinus size="15" />
							</Button>
							{$t('lists.remove-list')}
						</div>
					</DropdownItem>
				</DotMenu>
			</div>
			<h5
				class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis"
				style="min-height: 30px"
			>
				{$card?.name || listName || ''}
			</h5>
			{#if $card}
				<ListCardPreview list={$card} />
				<div class="absolute" style="bottom: 0.5rem; right: 0.3rem">
					<UsersByListMini {listId} />
				</div>
			{/if}
		</div>
		{#if isMoving && !isMovedAfterMe && !isMovingMe}
			<div
				class="insert-after mobile absolute -bottom-7 -right-4 md:hidden"
				on:click={stopMouseEvent}
				on:mousedown={stopMouseEvent}
			>
				<div on:click|stopPropagation|preventDefault={onInsertAfter}>
					<ArrowLeft color="#1a56db" />
				</div>
			</div>
			<div
				class="insert-after desktop absolute -top-4 -right-7 hidden md:block"
				on:click={stopMouseEvent}
				on:mousedown={stopMouseEvent}
			>
				<div on:click|stopPropagation|preventDefault={onInsertAfter}>
					<ArrowDown color="#1a56db" />
				</div>
			</div>
		{/if}
		{#if isMoving && !isMovingMe && isFirst}
			<div
				class="insert-before mobile md:hidden absolute -top-6 -right-4 "
				on:click={stopMouseEvent}
				on:mousedown={stopMouseEvent}
			>
				<div on:click|stopPropagation|preventDefault={onInsertBefore}>
					<ArrowLeft color="#1a56db" />
				</div>
			</div>
			<div
				class="insert-before desktop hidden md:block absolute -top-4 -left-7 "
				on:click={stopMouseEvent}
				on:mousedown={stopMouseEvent}
			>
				<div on:click|stopPropagation|preventDefault={onInsertBefore}>
					<ArrowDown color="#1a56db" />
				</div>
			</div>
		{/if}
	</Card>
</div>

<style>
	.w-76 {
		width: 19rem;
	}
</style>
