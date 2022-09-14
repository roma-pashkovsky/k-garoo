<script lang="ts">
	import type { CategoryOption, CheckListItem, Proposition } from '../../types';
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import { ArrowRight } from 'svelte-heros';
	import { createEventDispatcher, onMount } from 'svelte';
	import { customCategoryId, otherCategoryId } from '../../utils/local-storage-state';
	import ChecklistItemCategoryInput from './ChecklistItemCategoryInput.svelte';
	import { ChevronLeft } from 'svelte-heros-v2';
	import { FuzzySearch } from '../../utils/fuzzy-search';
	import { swipe } from 'svelte-gestures';
	import { fade } from 'svelte/transition';
	import { ChecklistDetailsStore } from '../../stores/checklist-details/checklist-details-store';
	import { getUID } from '../../utils/get-uid';
	import { CategoryAutodetector } from '../../stores/checklist-details/category-autodetector';
	import { debouncer } from '../../utils/debouncer';
	import { isEnter, Keycodes } from '../../utils/keycodes';
	import AppDivInput from '../AppDivInput.svelte';

	export let editedItem: CheckListItem;
	export let editedCategoryId: string;
	export let isByCategoryView: boolean;
	export let categoryOptions: CategoryOption[];
	export let propositionsFuzzySearch: FuzzySearch<Proposition>;
	export let store: ChecklistDetailsStore;
	export let categoryAutodetector: CategoryAutodetector;

	const dispatch = createEventDispatcher();
	let inputEl: HTMLInputElement;
	let customCategoryInput: string;
	let prevEditedItemId: string;
	let propositions: Proposition[] = [];
	let propositionsHighlightIndex = 0;
	let selectedPropositionTS: number;
	let shouldAutodetectCategory = true;
	const debounce = debouncer(300);

	$: {
		if (editedItem?.id !== prevEditedItemId) {
			shouldAutodetectCategory = editedCategoryId === otherCategoryId;
			propositions = [];
			focus();
		}
		prevEditedItemId = editedItem?.id;
	}

	$: displayPropositions = propositions.slice(1);
	$: resetIdForInput = editedItem?.id + selectedPropositionTS;

	onMount(() => {
		shouldAutodetectCategory = editedCategoryId === otherCategoryId;
		focus();
	});

	function focus() {
		if (inputEl) {
			inputEl.focus();
		}
		setTimeout(() => {
			if (inputEl) {
				inputEl.focus();
			}
		}, 200);
	}

	function onDescriptionInputKeyUp(ev: KeyboardEvent): void {
		if (isEnter(ev)) {
			return onAddFormSubmit();
		}
		const { keyCode } = ev;
		if (keyCode === Keycodes.ARROW_UP || keyCode === Keycodes.ARROW_DOWN) {
			return onPropositionHighlightChange(keyCode);
		}
		onInputChange();
	}

	function onDescriptionInputKeyDown(ev: KeyboardEvent) {
		if (isEnter(ev)) {
			onAddFormSubmit();
		}
	}

	function onInputChange() {
		propositions = [
			{ ...editedItem } as Proposition,
			...getFilteredPropositions(editedItem.itemDescription)
		];
		propositionsHighlightIndex = 0;
		if (shouldAutodetectCategory) {
			debounce(() => {
				const detected = categoryAutodetector.detect(editedItem.itemDescription);
				editedCategoryId = detected.id;
			});
		}
	}

	function onPropositionHighlightChange(keyCode: number): void {
		if (!propositions?.length) {
			return;
		}
		if (keyCode === Keycodes.ARROW_UP) {
			propositionsHighlightIndex =
				(propositionsHighlightIndex - 1 + propositions.length) % propositions.length;
		} else {
			propositionsHighlightIndex = (propositionsHighlightIndex + 1) % propositions.length;
		}
		const prop = propositions[propositionsHighlightIndex];
		selectedPropositionTS = new Date().getTime();
		editedItem.itemDescription = prop.itemDescription;
		editedCategoryId = prop.category.id;
	}

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
				id: getUID(),
				name: customCategoryInput
			};
		}
		dispatch('form-submit', { addCategory });
	}

	function getFilteredPropositions(editedItemDesc: string): Proposition[] {
		if (!editedItemDesc?.length) {
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
		selectedPropositionTS = new Date().getTime();
		propositions = [];
		focus();
		// update proposition last used utc
		prop.lastUsedUTC = new Date().getTime();
		store.updateProposition(prop);
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
			<form on:submit|preventDefault={onAddFormSubmit} class="w-full h-full !p-0">
				<!--			<AppDivInput-->
				<!--				id={resetIdForInput}-->
				<!--				bind:value={editedItem.itemDescription}-->
				<!--				bind:div={inputEl}-->
				<!--				on:keyup={onDescriptionInputKeyUp}-->
				<!--				on:input={onDescriptionInputKeyDown}-->
				<!--			/>-->
				<input
					class="single-line w-full form-input block !border-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none focus:bg-blue-100 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 p-2.5 text-sm"
					id="form-input"
					autocomplete="off"
					autofocus
					bind:value={editedItem.itemDescription}
					bind:this={inputEl}
					on:keyup={onDescriptionInputKeyUp}
				/>
				<button type="submit" class="hidden" />
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
	<div class="flex h-8 pl-10">
		{#each displayPropositions as proposition, index}
			<div
				class="py-2 ml-1 align-middle text-gray-700 text-sm whitespace-nowrap text-ellipsis overflow-hidden"
				transition:fade
				on:mousedown|stopPropagation|preventDefault={() => onPropositionClick(proposition)}
				onmousedown="event.stopPropagation()"
				onmouseup="event.stopPropagation()"
				onclick="event.stopPropagation()"
			>
				{#if index !== 0}
					<span class="inline-block mx-1">|</span>
				{/if}
				{proposition.itemDescription}
			</div>
		{/each}
	</div>
</form>

<style>
</style>
