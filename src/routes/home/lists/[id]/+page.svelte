<script lang="ts">
	import { goto } from '$app/navigation';
	import { Briefcase, DocumentDuplicate, DocumentRemove } from 'svelte-heros';
	import { getState, setState } from '../../../../utils/local-storage-state';
	import type { CheckList, CheckListItem, KGarooState } from '../../../../types';
	import { page } from '$app/stores';
	import EmptyPage from '../../../../lib/EmptyPage.svelte';
	import { copyToClipboard } from '../../../../utils/copy-to-clipboard';
	import { Button } from 'flowbite-svelte';
	import { swipe } from 'svelte-gestures';
	import { locale, t, translate } from '../../../../utils/i18n.js';
	import DetailsTopBar from '../../../../lib/DetailsTopBar.svelte';
	import DetailsPage from '../../../../lib/DetailsPage.svelte';
	import DetailsBody from '../../../../lib/DetailsBody.svelte';
	import { ToastService } from '../../../../utils/toasts';
	import type { ToastManagerType } from '../../../../utils/toasts';

	const toastManager: ToastManagerType = ToastService.getInstance();
	let state: KGarooState = getState();
	const list = (state.listData || {})[$page.params.id] as CheckList;

	export let listName = list?.name;
	export let isEditListName = false;
	export function onEditListNameOpen(): void {
		isEditListName = true;
	}
	export function onEditListNameSubmit(): void {
		saveCurrentList();
		isEditListName = false;
	}
	export let items: CheckListItem[] = list?.items || [];

	export function onBackClicked(): void {
		if (list) {
			saveCurrentList();
		}
		goto('/home/lists');
	}

	export function onItemClick(id: string): void {
		items = items.map((source) => {
			return {
				...source,
				checked: id === source.id ? !source.checked : source.checked
			} as CheckListItem;
		});
		saveCurrentList();
	}

	export let isByCategoryView = state?.checklistSettings?.isGroupByCategory || false;
	function onToggleByCategoryView() {
		isByCategoryView = !isByCategoryView;
		state = {
			...state,
			checklistSettings: {
				...(state.checklistSettings || ({} as any)),
				isGroupByCategory: isByCategoryView
			}
		};
		setState(state);
	}
	$: byCategoryList = getByCategoryList(items);

	function getByCategoryList(items): any[] {
		const byCategoryObj = {};
		items.forEach((item) => {
			if (!byCategoryObj[item.category]) {
				byCategoryObj[item.category] = [];
			}
			byCategoryObj[item.category].push(item);
		});
		return Object.keys(byCategoryObj).map((category) => {
			return {
				category,
				items: byCategoryObj[category]
			};
		});
	}

	function onRemoveClicked() {
		if (confirm(translate($locale, 'lists.details.remove-warning'))) {
			const oldState = { ...state };
			delete oldState.listData[list.id];
			oldState.listIds = oldState.listIds.filter((id) => id !== list.id);
			setState({ ...oldState });
			goto('/home/lists');
		}
	}

	function onRemoveItemFromTheList(id: string): void {
		items = items.filter((it) => it.id !== id);
		saveCurrentList();
	}

	async function onDuplicateClicked(): Promise<void> {
		const listToDuplicate: CheckList = {
			id: list.id,
			name: listName,
			items: list.items.map((s) => ({ ...s, checked: false })),
			created_utc: new Date().getTime()
		};
		const stringified = JSON.stringify(listToDuplicate);
		const encoded = encodeURIComponent(stringified);
		const url = window.origin + '/decode/' + encoded;
		await copyToClipboard(url);
		toastManager.push({
			text: ($t as any)('lists.details.link-created')
		});
	}

	function saveCurrentList(): void {
		const newState = {
			...state,
			listData: {
				...state.listData,
				[list.id]: {
					...list,
					name: listName,
					items: [...items] as CheckListItem[]
				} as CheckList
			}
		};
		setState(newState);
	}

	function onListBodyDblClick(): void {
		saveCurrentList();
		goto(`/home/lists/${list?.id}/edit`);
	}
</script>

<svelte:head>
	<title>K-garoo - {list?.name}</title>
</svelte:head>

<DetailsPage>
	<DetailsTopBar on:back-clicked={onBackClicked}>
		<div slot="page-title">
			{#if isEditListName}
				<form on:submit|preventDefault={onEditListNameSubmit}>
					<input
						id="list-name"
						autofocus
						type="text"
						bind:value={listName}
						on:blur={onEditListNameSubmit}
					/>
				</form>
			{:else}
				<h3 on:click|stopPropagation={onEditListNameOpen} class="font-medium text-sm sm:text-2xl">
					{listName}
				</h3>
			{/if}
		</div>
		<div slot="right-content" class="flex items-center right">
			{#if !!list}
				<div on:click={onDuplicateClicked}>
					<Button
						color="white"
						outline="true"
						class="!p-2 flex items-center justify-center"
						style="width: 40px; height: 40px"
					>
						<DocumentDuplicate size="25" />
					</Button>
				</div>
				<div on:click={onRemoveClicked}>
					<Button
						color="white"
						class="!p-2 flex items-center justify-center ml-3"
						style="width: 40px; height: 40px"
					>
						<DocumentRemove size="25" />
					</Button>
				</div>
				<div class="ml-3" on:click={onToggleByCategoryView}>
					<Button
						class="!p-2 flex items-center justify-center"
						color={isByCategoryView ? 'light' : 'white'}
						style="width: 40px; height: 40px"
					>
						<Briefcase variation={isByCategoryView ? 'solid' : 'outline'} size="25" />
					</Button>
				</div>
			{/if}
		</div>
	</DetailsTopBar>
	<DetailsBody on:body-long-press={onListBodyDblClick}>
		<div>
			{#if !list}
				<EmptyPage>The list was not found.</EmptyPage>
			{/if}
			{#if isByCategoryView}
				{#each byCategoryList as categoryItem}
					<div class="mb-6">
						<div>
							<h5 class="text-gray-600 text-sm">{categoryItem.category}</h5>
						</div>
						<div class="filler-block" />
						<ul>
							{#each categoryItem.items as item}
								<li
									use:swipe={{
										timeframe: 300,
										minSwipeDistance: 80,
										touchAction: 'pan-left pan-y'
									}}
									on:swipe={() => onRemoveItemFromTheList(item.id)}
									on:click|stopPropagation={() => onItemClick(item.id)}
									class="checklist-item space-x-2 flex items-center flex-1 pl-4 {item.checked
										? 'completed'
										: ''}"
								>
									{item.itemDescription}
								</li>
								<div class="filler-block" />
							{/each}
						</ul>
					</div>
				{/each}
			{:else}
				{#each items as item}
					<div
						use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-left pan-y' }}
						on:swipe={() => onRemoveItemFromTheList(item.id)}
						on:click|stopPropagation={() => onItemClick(item?.id)}
						class="checklist-item flex items-center {item?.checked ? 'completed' : ''}"
					>
						<div class="left space-x-2 flex items-center flex-1">
							{item?.itemDescription}
						</div>
						<div
							onclick="event.stopPropagation()"
							class="checkbox flex items-center justify-end ml-2"
							style="height: 42px;"
						>
							<div class="text-sm text-gray-600">
								{item?.category}
							</div>
						</div>
					</div>
					<div class="filler-block" />
				{/each}
			{/if}
		</div>
	</DetailsBody>
</DetailsPage>

<style>
	.checklist-item {
		height: 25px;
	}
	.completed {
		position: relative;
	}
	.completed:before {
		content: '';
		position: absolute;
		top: 13px;
		left: 0;
		right: 0;
		z-index: 2;
		border-bottom: 1px solid black;
	}

	.filler-block {
		height: 20px;
	}
</style>
