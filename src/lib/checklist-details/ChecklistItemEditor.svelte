<script lang="ts">
	import type { CategoryOption, CheckListItem, Proposition } from '../../types';
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import { ArrowRight } from 'svelte-heros';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
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
	import ChecklistEditorDemo from '../checklist-details-demo/ChecklistEditorDemo.svelte';
	import { t } from '../../utils/i18n.js';

	export let editedItem: CheckListItem;
	export let editedCategoryId: string;
	export let isByCategoryView: boolean;
	export let categoryOptions: CategoryOption[];
	export let propositionsFuzzySearch: FuzzySearch<Proposition>;
	export let store: ChecklistDetailsStore;
	export let categoryAutodetector: CategoryAutodetector;
	export let isFirstTimeUse: boolean;

	const dispatch = createEventDispatcher();
	let inputEl: HTMLInputElement;
	let customCategoryInput: string;
	let prevEditedItemId: string;
	let propositions: Proposition[] = [];
	let propositionsHighlightIndex = 0;
	let selectedPropositionTS: number;
	let shouldAutodetectCategory = true;
	let submittedOnEnterPressed = false;
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
	$: isValidInput =
		editedItem.itemDescription?.length > 0 &&
		!(editedCategoryId === customCategoryId && !customCategoryInput?.length);

	onMount(() => {
		shouldAutodetectCategory = editedCategoryId === otherCategoryId;
		focus();
	});

	onDestroy(() => {
		dispatch('destroy');
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

	function getLines(text: string): string[] {
		if (text?.length) {
			return text.split(/[\n\r]/);
		} else {
			return [];
		}
	}

	function getLineCount(text: string): number {
		return (text.match(/[\n\r]/g) || []).length + 1;
	}

	function onInput(event): void {
		const val = editedItem.itemDescription;
		if (getLineCount(val) > 1) {
			event.preventDefault();
			editedItem.itemDescription = getLines(val)[0];
			onAddFormSubmit();
		}
	}

	function onDescriptionInputKeyUp(ev: KeyboardEvent): void {
		if (isEnter(ev) || submittedOnEnterPressed) {
			return;
		}
		const { keyCode } = ev;
		if (keyCode === Keycodes.ARROW_UP || keyCode === Keycodes.ARROW_DOWN) {
			return onPropositionHighlightChange(keyCode);
		}
		onInputChange();
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
		if (!isValidInput) {
			return;
		}
		let addCategory: CategoryOption;
		if (editedCategoryId === customCategoryId) {
			addCategory = {
				id: getUID(),
				color: undefined,
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

<!--use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-y' }}-->
<!--on:swipe={onFormSwipe}-->
<form
	onclick="event.stopPropagation()"
	on:submit|preventDefault={onAddFormSubmit}
	on:swiped-right={onAddFormSubmit}
	class="relative flex items-start w-full"
>
	{#if isFirstTimeUse}
		<ChecklistEditorDemo on:next-click={focus} />
	{/if}
	<div class="left flex-1 relative">
		<!--		Top row-->
		<div class="top flex h-9 mb-2">
			<form on:submit|preventDefault={onAddFormSubmit} class="flex-1 h-full !p-0">
				<textarea
					class="resize-none focus:ring-0 single-line w-full h-full !bg-transparent form-input block !border-none disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 text-gray-900 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 p-1.5 text-sm"
					id="form-input"
					autocomplete="off"
					autofocus
					placeholder={$t('lists.details.add-item-placeholder')}
					rows="1"
					wrap="off"
					bind:value={editedItem.itemDescription}
					bind:this={inputEl}
					on:keyup={onDescriptionInputKeyUp}
					on:input={onInput}
				/>
				<button type="submit" class="hidden" />
			</form>
			{#if isByCategoryView}
				<div class=" flex-0">
					<ChecklistItemCategoryInput
						addWrapClass="rounded"
						bind:categoryId={editedCategoryId}
						bind:categoryOptions
						bind:customCategoryInput
					/>
				</div>
			{/if}
		</div>
		<!--		Bottom row-->
		<div class="bottom flex  relative max-w-full">
			<!--			Propositions-->
			<div class="flex-1 flex h-9 items-center">
				{#each displayPropositions as proposition, index}
					{#if index > 0}
						<div class="mx-2 h-9 leading-8 text-gray-500 dark:text-gray-400">
							<span class="align-middle text-sm">|</span>
						</div>
					{/if}
					<div
						class="prop-item text-ellipsis overflow-x-hidden whitespace-nowrap leading-8 h-9 text-gray-500 dark:text-gray-400 text-sm relative {index !==
						0
							? 'ml-1'
							: ''} {displayPropositions.length === 1
							? 'single'
							: displayPropositions.length === 2
							? 'two-fold'
							: ''}"
						transition:fade
						on:mousedown|stopPropagation|preventDefault={() => onPropositionClick(proposition)}
						onmousedown="event.stopPropagation()"
						onmouseup="event.stopPropagation()"
						onclick="event.stopPropagation()"
					>
						<span class="align-middle text-sm">{proposition.itemDescription}</span>
					</div>
				{/each}
			</div>
			<!--			Submit button-->
			<button
				type="submit"
				disabled={!isValidInput}
				on:mousedown|preventDefault|stopPropagation={onAddFormSubmit}
				class="!p-1.5 w-8 h-8 ml-2 rounded {isValidInput
					? 'bg-blue-600 text-white'
					: 'border border-blue-400 text-gray-500'}"
			>
				<ArrowRight size="18" />
			</button>
		</div>
	</div>
</form>

<style>
	.prop-item {
		max-width: 25%;
	}
	.prop-item.single {
		max-width: 80%;
	}
	.prop-item.two-fold {
		max-width: 40%;
	}
</style>
