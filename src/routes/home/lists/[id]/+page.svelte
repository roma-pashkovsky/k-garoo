<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, Briefcase, DocumentRemove } from 'svelte-heros';
	import { getState, setState } from '../../../../utils/local-storage-state';
	import type { CheckList, CheckListItem, KGarooState } from '../../../../types';
	import { page } from '$app/stores';

	const state: KGarooState = getState();
	const list = (state.listData || {})[$page.params.id] as CheckList;

	export let listName = list?.name;
	export let isEditListName = false;
	export function onEditListNameOpen(): void {
		isEditListName = true;
	}
	export function onEditListNameSubmit(): void {
		isEditListName = false;
	}
	export let items: CheckListItem[] = list?.items || [];

	export function onBackClicked(): void {
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
		goto('/home/lists');
	}

	export function onItemClick(id: string): void {
		items = items.map((source) => {
			return {
				...source,
				checked: id === source.id ? !source.checked : source.checked
			} as CheckListItem;
		});
	}

	export let isByCategoryView = false;
	function onToggleByCategoryView() {
		isByCategoryView = !isByCategoryView;
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
</script>

<section on:click={onEditListNameSubmit} class="section-container h-screen w-screen flex flex-col">
	<div
		class="flex justify-between items-center"
		style="padding-left: 2rem; padding-right: 2rem; padding-top: 1rem;"
	>
		<div class="flex items-center" style="height: 25px">
			<ArrowLeft on:click={onBackClicked} class="w-25 h-25" />
		</div>
		<div class="flex items-center left" style="height: 25px">
			{#if isEditListName}
				<form on:submit|preventDefault={onEditListNameSubmit}>
					<input id="list-name" autofocus type="text" bind:value={listName} />
				</form>
			{:else}
				<h3 on:click|stopPropagation={onEditListNameOpen} class="font-medium text-2xl">
					{listName}
				</h3>
			{/if}
		</div>
		<div class="flex items-center right">
			<div on:click={onRemoveClicked}>
				<button class="flex items-center justify-center" style="width: 42px; height: 42px">
					<DocumentRemove size="25" />
				</button>
			</div>
			<div class="ml-3" on:click={onToggleByCategoryView}>
				<button
					class="flex items-center justify-center {isByCategoryView ? 'bg-gray-100' : ''}"
					style="width: 42px; height: 42px"
				>
					<Briefcase variation={isByCategoryView ? 'solid' : 'outline'} size="25" />
				</button>
			</div>
		</div>
	</div>
	<div class="scroll-auto flex-1 p-8" style="padding-bottom: 200px;">
		{#if isByCategoryView}
			{#each byCategoryList as categoryItem}
				<div class="mb-6">
					<div>
						<h5 class="text-gray-600 text-sm">{categoryItem.category}</h5>
					</div>
					{#each categoryItem.items as item}
						<div
							on:click|stopPropagation={() => onItemClick(item.id)}
							class="left space-x-2 flex items-center flex-1 pl-2 {item.checked ? 'completed' : ''}"
							style="height: 42px;"
						>
							{item.itemDescription}
						</div>
					{/each}
				</div>
			{/each}
		{:else}
			{#each items as item}
				<div
					on:click|stopPropagation={() => onItemClick(item.id)}
					class="flex items-center {item.checked ? 'completed' : ''}"
				>
					<div class="left space-x-2 flex items-center flex-1" style="height: 42px;">
						{item.itemDescription}
					</div>
					<div
						onclick="event.stopPropagation()"
						class="checkbox flex items-center justify-end ml-2"
						style="height: 42px;"
					>
						<div class="text-sm text-gray-600">
							{item.category}
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</section>

<style>
	.completed {
		position: relative;
	}
	.completed:before {
		content: '';
		position: absolute;
		top: 21px;
		left: 0;
		right: 0;
		z-index: 2;
		border-bottom: 1px solid black;
	}
</style>
