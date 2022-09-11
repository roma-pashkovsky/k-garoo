<script lang="ts">
	import type { CategoryOption, CheckListItem, Proposition } from '../types';
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import { ArrowRight } from 'svelte-heros';
	import { createEventDispatcher, onMount } from 'svelte';
	import { customCategoryId } from '../utils/local-storage-state';
	import ChecklistItemCategoryInput from './ChecklistItemCategoryInput.svelte';
	import { ChevronLeft } from 'svelte-heros-v2';
	import { FuzzySearch } from '../utils/fuzzy-search';
	import { swipe } from 'svelte-gestures';
	import { fade } from 'svelte/transition';

	export let editedItem: CheckListItem;
	export let editedCategoryId: string;
	export let isByCategoryView: boolean;
	export let categoryOptions: CategoryOption[];
	export let propositionsFuzzySearch: FuzzySearch<Proposition>;

	const dispatch = createEventDispatcher();
	let inputEl: HTMLInputElement;
	let customCategoryInput: string;
	let prevEditedItemId: string;
	let propositions: Proposition[] = [];

	$: {
		if (editedItem?.id !== prevEditedItemId) {
			focus();
		}
		prevEditedItemId = editedItem?.id;
	}

	onMount(() => {
		focus();
	});

	function onAddFormSubmit(): void {
		if (!editedItem.itemDescription?.length) {
			return;
		}
		if (editedCategoryId === customCategoryId && !customCategoryInput?.length) {
			return;
		}
		let addCategory: CategoryOption;
		if (editedCategoryId === customCategoryId) {
			addCategory = {
				id: '' + new Date().getTime(),
				name: customCategoryInput
			};
		}
		dispatch('form-submit', { addCategory });
	}

	function focus() {
		if (inputEl) {
			inputEl.focus();
			setTimeout(() => {
				inputEl.focus();
			}, 100);
		}
	}

	function onInputChange() {
		propositions = getFilteredPropositions(editedItem.itemDescription);
	}

	function getFilteredPropositions(editedItemDesc: string): Proposition[] {
		if (!editedItemDesc) {
			return [];
		}
		if (!propositionsFuzzySearch) {
			return [];
		}
		const res = propositionsFuzzySearch.search(editedItemDesc).map((r) => r.item);
		if (res.length < 3) {
			return res;
		} else {
			return res.slice(0, 3);
		}
	}

	function onPropositionClick(prop: Proposition) {
		editedItem.itemDescription = prop.itemDescription;
		editedCategoryId = prop.category.id;
		propositions = [];
		focus();
	}

	function onFormSwipe(event) {
		if (event.detail.direction === 'right') {
			onAddFormSubmit();
		}
	}
</script>

<form
	onclick="event.stopPropagation()"
	on:submit|preventDefault={onAddFormSubmit}
	use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-y' }}
	on:swipe={onFormSwipe}
>
	<ButtonGroup class="relative !w-full">
		<Button class="!py-2 !px-1" on:click={() => dispatch('dismiss')}>
			<ChevronLeft />
		</Button>
		<Button id="poptrigger" class="!p-0 flex-1">
			<form class="w-full p-0" on:submit|preventDefault={onAddFormSubmit}>
				<textarea
					class="w-full form-input block !border-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 p-2.5 text-sm"
					id="form-input"
					autocomplete="off"
					autofocus
					style="box-sizing: border-box; height: 40px; resize: none"
					bind:value={editedItem.itemDescription}
					bind:this={inputEl}
					on:submit={onAddFormSubmit}
					on:input={onInputChange}
				/>
			</form>
		</Button>
		{#if isByCategoryView}
			<Button class="!p-0" color="light">
				<ChecklistItemCategoryInput
					bind:categoryId={editedCategoryId}
					bind:categoryOptions
					bind:customCategoryInput
				/>
			</Button>
		{/if}
		<button
			type="submit"
			on:mousedown|preventDefault|stopPropagation={onAddFormSubmit}
			class="!py-2 !px-1 text-center font-medium focus:ring-2 focus:z-10 focus:outline-none inline-flex items-center justify-center px-4 py-2 text-sm text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 first:rounded-l-lg last:rounded-r-lg !p-2"
			color="blue"
		>
			<ArrowRight />
		</button>
	</ButtonGroup>
	<div class="flex h-8">
		{#each propositions as proposition, index}
			<div
				class="py-2 px-2 align-middle space-x-2 text-gray-700 text-sm whitespace-nowrap text-ellipsis overflow-hidden"
				transition:fade
				on:click|stopPropagation={() => onPropositionClick(proposition)}
				onmousedown="event.stopPropagation()"
				onmouseup="event.stopPropagation()"
				onclick="event.stopPropagation()"
			>
				{#if index !== 0}
					<span class="inline-block mr-2">|</span>
				{/if}
				{proposition.itemDescription}
			</div>
		{/each}
	</div>
</form>
