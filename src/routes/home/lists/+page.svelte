<script lang="ts">
	import { goto } from '$app/navigation';
	import type { CheckList, MainListItem } from '../../../types';
	import EmptyPage from '../../../lib/EmptyPage.svelte';
	import { getDecodeLinkToList } from '../../../utils/get-decode-link-to-list';
	import { ToastService } from '../../../utils/toasts';
	import ListCardChecklist from '../../../lib/main-list/ListCardChecklist.svelte';
	import {
		listItems as items,
		lastVisitedListId,
		removeList,
		reorderList
	} from '../../../stores/checklist-main-list/checklist-main-list-store';
	import { t } from '../../../stores/app/translate';
	import { derived, get, writable } from 'svelte/store';
	import { getUID } from '../../../utils/get-uid';
	import Page from '../../../lib/Page.svelte';
	import { Plus } from 'svelte-heros-v2';
	import { doubleTap } from '../../../utils/double-tap';
	import MoveCheckListBottomDrawer from '../../../lib/main-list/MoveCheckListBottomDrawer.svelte';
	import { checklistDetailsClientEditRoute } from '../../../utils/client-routes';
	import ChecklistSearch from '../../../lib/main-list/ChecklistSearch.svelte';

	const toastManager = ToastService.getInstance();
	const url = 'https://www.garoo.fun/home/lists';

	let draggingItemId: string | null = null;
	let hoverItemId: string | null = null;
	const movedChecklist = writable<MainListItem | null>(null);
	const movedIndex = derived([movedChecklist, items], ([moved, list]) => {
		if (!moved) {
			return -1;
		}
		return list.findIndex((it) => it.id === moved.id);
	});

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
			if (navigator && navigator.share) {
				await navigator.share({ url }).catch((err) => console.log(err));
			}
		} catch (err) {
			console.error(err);
			toastManager.push({
				text: 'Failed to copy url',
				color: 'warning'
			});
		}
	}

	function onCardClicked(id: string): void {
		lastVisitedListId.set(id);
		goto(checklistDetailsClientEditRoute(id));
	}

	function onAddButtonClicked() {
		const id = getUID();
		lastVisitedListId.set(id);
		goto(checklistDetailsClientEditRoute(id));
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

	function onListInsertAfter(afterId: string): void {
		const currList = [...get(items)];
		const newList = [];
		currList.forEach((it) => {
			if (it.id !== $movedChecklist.id) {
				newList.push(it);
			}
			if (it.id === afterId) {
				newList.push({ id: $movedChecklist.id, name: $movedChecklist.name });
			}
		});
		reorderList(newList);
		movedChecklist.set(null);
		toastManager.push({
			text: get(t)('app.toasts.success'),
			color: 'success',
			type: 'page-bottom',
			onCancel: () => {
				reorderList(currList);
			}
		});
	}

	// means moving to the top of the list
	function onListInsertBefore(beforeId: string, beforeInd: number): void {
		const currList = [...get(items)];
		let newList: MainListItem[] = [];
		if (beforeInd === $movedIndex + 1) {
			newList = [...currList];
			const temp = newList[$movedIndex];
			newList[$movedIndex] = currList[beforeInd];
			newList[beforeInd] = temp;
		} else if (beforeInd > $movedIndex) {
			currList.forEach((it) => {
				if (it.id !== $movedChecklist.id) {
					newList.push(it);
				}
				if (it.id === beforeId) {
					newList.push($movedChecklist);
				}
			});
		} else {
			currList.forEach((it) => {
				if (it.id === beforeId) {
					newList.push($movedChecklist);
				}
				if (it.id !== $movedChecklist.id) {
					newList.push(it);
				}
			});
		}
		reorderList(newList);
		movedChecklist.set(null);
		toastManager.push({
			text: get(t)('app.toasts.success'),
			color: 'success',
			type: 'page-bottom',
			onCancel: () => {
				reorderList(currList);
			}
		});
	}
</script>

<svelte:head>
	<title>Garoo - {$t('app.my_lists')}</title>
	<meta property="og:type" content="article" />
	<meta property="og:url" content={url} />
	<meta property="og:site_name" content="Garoo" />
	<meta property="og:description" content={$t('app.logo')} />
	<meta property="og:title" content={$t('app.my_lists')} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:description" content={$t('app.logo')} />
	<meta name="twitter:site" content="@business" />
	<meta name="twitter:title" content={$t('app.my_lists')} />
</svelte:head>

<div class="hidden md:flex absolute top-8 right-8 z-10 flex-col items-end">
	<button
		use:doubleTap
		on:tap={onAddButtonClicked}
		class="text-center font-medium focus:ring-4 inline-flex items-center justify-center px-5 py-2.5 text-sm text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 rounded-lg !p-2 shadow-md"
		><Plus class="w-7 h-7" /></button
	>
	<div class="mt-4 h-[42px] w-[44px] relative">
		<div class="absolute right-0">
			<ChecklistSearch />
		</div>
	</div>
</div>
<div class="flex md:hidden absolute bottom-4 right-4 p-2 z-10 flex-col items-end">
	<div class="mb-4 h-[42px] w-[44px] relative">
		<div class="absolute right-0">
			<ChecklistSearch />
		</div>
	</div>
	<button
		use:doubleTap
		on:tap={onAddButtonClicked}
		class="text-center font-medium focus:ring-4 inline-flex items-center justify-center px-5 py-2.5 text-sm text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 rounded-lg !p-2 shadow-md"
		><Plus class="w-7 h-7" /></button
	>
</div>

<Page>
	<div
		class="flex items-start justify-center"
		on:dblclick={() => {
			movedChecklist.set(null);
		}}
	>
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
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 pb-36">
			{#each $items as item, index (item.id)}
				<ListCardChecklist
					listItem={item}
					{draggingItemId}
					{hoverItemId}
					lastVisitedId={$lastVisitedListId}
					{index}
					movedIndex={$movedIndex}
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
					on:move={() => {
						movedChecklist.set(item);
					}}
					on:insert-after={() => onListInsertAfter(item.id)}
					on:insert-before={() => onListInsertBefore(item.id, index)}
				/>
			{/each}
		</div>
	</div>
</Page>
<MoveCheckListBottomDrawer
	movedChecklist={$movedChecklist}
	on:drawer-close={() => {
		movedChecklist.set(null);
	}}
/>
