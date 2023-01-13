<script lang="ts">
	import type { CheckListItem, MainListItem } from '../../types';
	import {derived, get, writable} from 'svelte/store';
	import {
		listDataStore,
		loadList,
		updateList
	} from '../../stores/checklist-details/checklist-details-data';
	import { createEventDispatcher, onMount } from 'svelte';
	import { A, Button } from 'flowbite-svelte';
	import { ChevronDown, ChevronUp } from 'svelte-heros-v2';
	import { checklistDetailsClientRoute } from '../../utils/client-routes';
	import {t} from "../../stores/app/translate";
	import {slide} from "svelte/transition";
	import {getUID} from "../../utils/get-uid";

	export let list: MainListItem;
	export let movedItems: CheckListItem[];

	let listId: string;
	let listName: string;
	let listRoute: string;
	const itemsMap = writable({});
	let isExpanded = false;
	const dispatch = createEventDispatcher();
	const card = derived(listDataStore, ($listDataStore) => {
		return $listDataStore[listId];
	});
	const cardItems = derived(card, (card$) => {
		return card$?.items || [];
	});
	const displayCardItems = derived([cardItems, itemsMap], ([cardItems$, itemsMap$]) => {
		return cardItems$.map(s => {
			return {
				id: s.id,
				itemDescription: s.itemDescription,
				isMoved: !!itemsMap$[s.itemDescription.toLowerCase()]
			}
		})
	})
	const isMoved = derived([cardItems, itemsMap], ([cardItems$, itemsMap$]) => {
		const mapCopy = { ...itemsMap$ };
		cardItems$.forEach((it) => {
			delete mapCopy[it.itemDescription.toLowerCase()];
		});
		return Object.keys(mapCopy).length === 0;
	});

	onMount(() => {
		listId = list.id;
		listName = list.name;
		listRoute = checklistDetailsClientRoute(listId);
		itemsMap.set(
			(movedItems || [])
				.filter((it) => !!it.itemDescription)
				.reduce((p, c) => {
					return { ...p, [c.itemDescription.toLowerCase()]: true };
				}, {})
		);
		loadList(listId, true, fetch);
	});

	function onMoveClicked(): void {
		if (!$isMoved) {
			const existingItems = get(cardItems);
			const existingMap = existingItems.reduce((p, c) => ({...p, [c.itemDescription.toLowerCase()]: true }), {})
			const toBeAdded = [];
			movedItems.forEach((it, ind) => {
				const isExisting = existingMap[it.itemDescription.toLowerCase()];
				if (!isExisting) {
					toBeAdded.push({
						id: getUID(),
						itemDescription: it.itemDescription,
						category: {...it.category},
						orderAdded: existingItems.length + ind
					} as CheckListItem)
				}
			})
			updateList({ id: listId, items: { added: toBeAdded } });
		}
	}

	function onListLinkClicked() {
		dispatch('list-link-clicked');
	}
</script>

<div class="my-2 p-2 border rounded-lg">
	<div class="flex items-center justify-between space-x-2">
		<div class="w-24 overflow-ellipsis whitespace-nowrap">
			<A href={listRoute}>
				<span on:click={onListLinkClicked}>
					{listName}
				</span>
			</A>
		</div>
		<div class="flex items-center space-x-2">
			<Button outline={!$isMoved} disabled={$isMoved} on:click={onMoveClicked} class="!px-2">
				{$t('move-checklist-items.list-option-move-button-label')}
			</Button>
			<Button class="!p-2" color="light" pill={true} on:click={() => (isExpanded = !isExpanded)}>
				<div class="relative -bottom-1/2">
					{#if isExpanded}
						<ChevronUp />
					{:else}
						<ChevronDown />
					{/if}
				</div>
			</Button>
		</div>
	</div>
	{#if isExpanded}
		<div in:slide|local out:slide|local>
			{#each $displayCardItems as listItem (listItem.id)}
				<div class="pl-4 mb-2 text-sm { listItem.isMoved ? 'text-blue-600' : ''}">
					{listItem.itemDescription}
				</div>
			{/each}
		</div>
	{/if}
</div>
