<script lang="ts">
	import { sineIn } from 'svelte/easing';
	import { A, Button, CloseButton, Drawer, Input, Spinner } from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import {
		moveChecklistItemsEvent,
		onMoveChecklistItemsSearch
	} from '../../stores/checklist-details/move-checklist-items';
	import {
		closeMoveChecklistItems,
		moveChecklistItemsListOptions,
		moveChecklistItemsSearchValue
	} from '../../stores/checklist-details/move-checklist-items.js';
	import type { Unsubscriber } from 'svelte/store';
	import { derived } from 'svelte/store';
	import { t } from '../../stores/app/translate';
	import ChecklistItemMoveListCard from './ChecklistItemMoveListCard.svelte';
	import { getUID } from '../../utils/get-uid';
	import { getDefaultListName } from '../../utils/get-default-list-name';
	import { checklistDetailsClientRoute } from '../../utils/client-routes';
	import { createList } from '../../stores/checklist-details/checklist-details-data';
	import {click_outside} from "../../utils/click-outside";

	const items = derived(moveChecklistItemsEvent, (event$) => event$?.items);
	let isCreatingNewList: boolean;
	let newlyCreatedListId: string;
	let newlyCreatedListLink: string;
	let moveItemsDrawerHidden: boolean;
	const transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};
	let unsub: Unsubscriber;

	onMount(() => {
		unsub = moveChecklistItemsEvent.subscribe((ev) => {
			moveItemsDrawerHidden = !ev;
			isCreatingNewList = false;
			newlyCreatedListId = undefined;
			newlyCreatedListLink = undefined;
		});
	});

	onDestroy(() => {
		if (unsub) {
			unsub();
		}
	});

	async function onCreateNewListClicked(): Promise<void> {
		const listId = getUID();
		const newItems = $items;
		const newName = getDefaultListName();
		isCreatingNewList = true;
		try {
			await createList({ id: listId, name: newName, items: newItems });
		} catch (error) {
			console.error(error);
		} finally {
			isCreatingNewList = false;
		}
		newlyCreatedListId = listId;
		newlyCreatedListLink = checklistDetailsClientRoute(newlyCreatedListId);
	}

	function onSearchChecklists(): void {
		onMoveChecklistItemsSearch();
	}
</script>

<Drawer
	transitionType="fly"
	{transitionParams}
	bind:hidden={moveItemsDrawerHidden}
	position="fixed"
	placement="right"
	class="w-80"
	id="share-drawer"
>
	<div use:click_outside on:click_outside={closeMoveChecklistItems} class="absolute inset-4">
		<div class="flex items-center" style="padding-top: env(safe-area-inset-top)">
			<h5
					id="drawer-label"
					class="inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
			>
				{$t('move-checklist-items.drawer-title')}
			</h5>
			<CloseButton on:click={closeMoveChecklistItems} class="mb-4 dark:text-white" />
		</div>
		<div class="mt-2 flex justify-center">
			<div>
				<Button size="md" outline disabled={!!newlyCreatedListId} on:click={onCreateNewListClicked}>
					{#if isCreatingNewList}
						<Spinner class="mr-2" size="3" />
					{/if}
					{$t('move-checklist-items.new-list-button-label')}
				</Button>
				{#if newlyCreatedListId}
					<A class="my-2 text-sm !block" href={newlyCreatedListLink}>
						<span on:click={closeMoveChecklistItems}>{$t('move-checklist-items.new-list-created-link')}</span>
					</A>
				{/if}
			</div>
		</div>
		<div class="my-4 text-gray-600 dark:text-gray-200 flex items-center">
			<div class="border-t flex-1" />
			<div class="mx-4">{$t('share-list.modal.or')}</div>
			<div class="border-t flex-1" />
		</div>
		<div class="mb-6">
			<Input
					bind:value={$moveChecklistItemsSearchValue}
					id="user-name"
					name="user-name"
					placeholder={$t('move-checklist-items.search-lists-placeholder')}
					on:input={onSearchChecklists}
			/>
		</div>
		<div>
			{#each $moveChecklistItemsListOptions as listItem (listItem.id)}
				<ChecklistItemMoveListCard
						list={listItem}
						movedItems={$items}
						on:list-link-clicked={closeMoveChecklistItems}
				/>
			{/each}
		</div>
	</div>

</Drawer>
