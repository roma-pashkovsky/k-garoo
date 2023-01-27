<script lang="ts">
	import { A, Button, Input, Spinner } from 'flowbite-svelte';
	import type { CheckListItem } from '../../types';
	import { getUID } from '../../utils/get-uid';
	import { getDefaultListName } from '../../utils/get-default-list-name';
	import { createList } from '../../stores/checklist-details/checklist-details-data';
	import { checklistDetailsClientRoute } from '../../utils/client-routes';
	import {
		initAllListSearchOptions,
		onMoveChecklistItemsSearch
	} from '../../stores/checklist-details/move-checklist-items';
	import {
		closeMoveChecklistItems,
		moveChecklistItemsListOptions,
		moveChecklistItemsSearchValue
	} from '../../stores/checklist-details/move-checklist-items.js';
	import { t } from '../../stores/app/translate.js';
	import ChecklistItemMoveListCard from './ChecklistItemMoveListCard.svelte';

	export let items: CheckListItem[];
	export let newListName: string;
	let isCreatingNewList: boolean;
	let newlyCreatedListId: string;
	let newlyCreatedListLink: string;

	async function onCreateNewListClicked(): Promise<void> {
		const listId = getUID();
		const newItems = items.map((s, ind) => {
			return {
				id: getUID(),
				itemDescription: s.itemDescription,
				category: { ...s.category },
				orderAdded: ind
			} as CheckListItem;
		});
		const newName = newListName || getDefaultListName();
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
		initAllListSearchOptions();
	}

	function onSearchChecklists(): void {
		onMoveChecklistItemsSearch();
	}
</script>

<div class="mt-2 flex justify-center">
	<div>
		<Button
			size="md"
			class="w-[190px]"
			outline
			disabled={!!newlyCreatedListId}
			on:click={onCreateNewListClicked}
		>
			{#if isCreatingNewList}
				<Spinner class="mr-2" size="3" />
			{/if}
			{$t('move-checklist-items.new-list-button-label')}
		</Button>
		{#if newlyCreatedListId}
			<div>
				<A
					class="my-2 text-sm flex justify-center items-center w-full !underline"
					href={newlyCreatedListLink}
				>
					<span on:click={closeMoveChecklistItems}
						>{$t('move-checklist-items.new-list-created-link')}</span
					><span>. {$t('app.common.open')}</span>
				</A>
			</div>
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
			movedItems={items}
			on:list-link-clicked={closeMoveChecklistItems}
		/>
	{/each}
</div>
