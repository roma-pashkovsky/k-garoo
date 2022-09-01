<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, Briefcase, DocumentRemove, DocumentDuplicate } from 'svelte-heros';
	import { getState, setState } from '../../../../utils/local-storage-state';
	import type { CheckList, CheckListItem, KGarooState } from '../../../../types';
	import { page } from '$app/stores';
	import EmptyPage from '../../../../lib/EmptyPage.svelte';
	import { copyToClipboard } from '../../../../utils/copy-to-clipboard';
	import { Toast, Button } from 'flowbite-svelte';
	import { swipe } from 'svelte-gestures';

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
			checklistSettings: { ...(state.checklistSettings || {}), isGroupByCategory: isByCategoryView }
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
		if (confirm('Will remove list. Are you sure?')) {
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

	export let isShowLinkCopiedToast = false;
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
		isShowLinkCopiedToast = true;
		setTimeout(() => {
			isShowLinkCopiedToast = false;
		}, 3000);
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
		console.log('dbl click');
		saveCurrentList();
		goto(`/home/lists/${list?.id}/edit`);
	}
</script>

<svelte:head>
	<title>K-garoo - {list?.name}</title>
</svelte:head>

<div on:dblclick={onListBodyDblClick} class="section-container h-screen w-screen flex flex-col">
	<div
		class="sticky flex justify-between items-center bg-white z-30"
		style="padding-left: 2rem; padding-right: 2rem; padding-top: 1rem;"
	>
		<div class="flex items-center" style="height: 25px">
			<Button color="white" class="!p-2">
				<ArrowLeft on:click={onBackClicked} class="w-25 h-25" />
			</Button>
		</div>
		<div class="flex items-center left" style="height: 25px">
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
				<h3
					on:click|stopPropagation={onEditListNameOpen}
					class="font-medium sm:text-sm lg:text-2xl"
				>
					{listName}
				</h3>
			{/if}
		</div>
		<div class="flex items-center right">
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
	</div>
	<div class="scroll-auto flex-1 p-8" style="padding-bottom: 200px;">
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
								use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-left pan-y' }}
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
	{#if isShowLinkCopiedToast}
		<div class="toast-wrapper">
			<Toast simple={true} class="bg-blue-200">Link copied to clipboard</Toast>
		</div>
	{/if}
</div>

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

	.toast-wrapper {
		position: fixed;
		bottom: 3px;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
	}

	.filler-block {
		height: 20px;
	}

	.sticky {
		position: sticky;
		top: 0;
	}
</style>
