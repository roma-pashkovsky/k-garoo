<script lang="ts">
	import { page } from '$app/stores';
	import { isAuthed } from '../../../utils/is-authed';
	import { getState, setState } from '../../../utils/local-storage-state';
	import type { CheckList, CheckListItem } from '../../../types';
	import { goto } from '$app/navigation';
	import { Briefcase } from 'svelte-heros';
	import EmptyPage from '../../../lib/EmptyPage.svelte';
	import { onMount } from 'svelte';

	export let parsed: CheckList = undefined;
	export let items: CheckListItem[] = [];
	export let isShowBasicAccessUI = false;

	export let isByCategoryView = true;
	function onToggleByCategoryView() {
		isByCategoryView = !isByCategoryView;
	}
	$: byCategoryList = getByCategoryList(items);

	onMount(() => {
		const uri = $page.params.uri;
		if (!uri) {
			throw new Error('Bad uri');
		}
		const str = decodeURIComponent(uri);
		parsed = JSON.parse(str);
		if (parsed) {
			items = parsed.items;
			process();
		} else {
			throw new Error('Unable to parse url');
		}
	});

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

	export function onItemClick(id: string): void {
		items = items.map((source) => {
			return {
				...source,
				checked: id === source.id ? !source.checked : source.checked
			} as CheckListItem;
		});
	}

	async function process(): Promise<void> {
		if (await isAuthed()) {
			const state = getState();
			const listData = state.listData || {};
			const listIds = state.listIds || [];
			if (!listData[parsed.id]) {
				listIds.unshift(parsed.id);
			}
			listData[parsed.id] = parsed;
			setState({ ...state, listIds, listData });
			goto('/home/lists/' + parsed.id);
		} else {
			isShowBasicAccessUI = true;
		}
	}
</script>

<svelte:head>
	<title>K-garoo - {parsed?.name}</title>
</svelte:head>

{#if isShowBasicAccessUI}
	<section class="section-container h-screen w-screen flex flex-col">
		<div class="flex justify-center text-sm bg-blue-700 text-white p-1">
			<a class="underline" href="/login">Login</a>&nbsp; to access all features of K-garoo.
		</div>
		<div
			class="flex justify-between items-center"
			style="padding-left: 2rem; padding-right: 2rem; padding-top: 1rem;"
		>
			<div class="flex items-center left" style="height: 25px">
				<h3 class="font-medium text-2xl">
					{parsed?.name}
				</h3>
			</div>
			<div class="flex items-center right">
				{#if !!parsed}
					<div class="ml-3" on:click={onToggleByCategoryView}>
						<button
							class="flex items-center justify-center {isByCategoryView ? 'bg-gray-100' : ''}"
							style="width: 42px; height: 42px"
						>
							<Briefcase variation={isByCategoryView ? 'solid' : 'outline'} size="25" />
						</button>
					</div>
				{/if}
			</div>
		</div>
		<div class="scroll-auto flex-1 p-8" style="padding-bottom: 200px;">
			{#if !parsed}
				<EmptyPage>Unable to parse link. :(</EmptyPage>
			{/if}
			{#if isByCategoryView}
				{#each byCategoryList as categoryItem}
					<div class="mb-6">
						<div>
							<h5 class="text-gray-600 text-sm">{categoryItem.category}</h5>
						</div>
						{#each categoryItem.items as item}
							<div
								on:click|stopPropagation={() => onItemClick(item.id)}
								class="left space-x-2 flex items-center flex-1 pl-2 {item.checked
									? 'completed'
									: ''}"
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
						on:click|stopPropagation={() => onItemClick(item?.id)}
						class="flex items-center {item?.checked ? 'completed' : ''}"
					>
						<div class="left space-x-2 flex items-center flex-1" style="height: 42px;">
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
{/if}
