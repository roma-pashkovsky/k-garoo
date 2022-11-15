<script lang="ts">
	import type { CategoryOption, CheckListItem, Proposition } from '../../types';
	import type { FuzzySearch } from '../../utils/fuzzy-search';
	import { ArrowRight } from 'svelte-heros';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { customCategoryId } from '../../utils/local-storage-state';
	import ChecklistItemCategoryInput from './ChecklistItemCategoryInput.svelte';
	import { fade } from 'svelte/transition';
	import { getUID } from '../../utils/get-uid';
	import type { CategoryAutodetector } from '../../stores/checklist-details/category-autodetector';
	import { debouncer } from '../../utils/debouncer';
	import { isEnter, Keycodes } from '../../utils/keycodes';
	import ChecklistEditorDemo from '../checklist-details-demo/ChecklistEditorDemo.svelte';
	import { t } from '../../stores/app/translate';
	import { updateProposition } from '../../stores/checklist-details/propositions';
	import { stopMouseEvent } from '../../utils/stop-mouse-event.js';

	export let editedItem: CheckListItem;
	export let isFocusOnStart: boolean;
	export let editedCategoryId: string;
	export let isByCategoryView: boolean;
	export let categoryOptions: CategoryOption[];
	export let propositionsFuzzySearch: FuzzySearch<Proposition>;
	export let categoryAutodetector: CategoryAutodetector;
	export let isFirstTimeUse: boolean;
	export let shouldAutodetectCategory = true;

	const dispatch = createEventDispatcher();
	let inputEl: HTMLTextAreaElement;
	let isFocused = false;
	let customCategoryInput: string;
	let prevEditedItemId: string;
	let propositions: Proposition[] = [];
	let propositionsHighlightIndex = 0;
	let selectedPropositionTS: number;
	let initialCategoryId: string;
	let submittedOnEnterPressed = false;
	const debounce = debouncer(300);

	$: {
		if (editedItem?.id !== prevEditedItemId) {
			initialCategoryId = editedCategoryId;
			propositions = [];
			focus();
		}
		prevEditedItemId = editedItem?.id;
	}

	$: displayPropositions = propositions.slice(1);
	$: isValidInput =
		editedItem.itemDescription?.length > 0 &&
		!(editedCategoryId === customCategoryId && !customCategoryInput?.length);

	onMount(() => {
		focus();
	});

	onDestroy(() => {
		dispatch('destroy');
	});

	function focus() {
		if (inputEl) {
			inputEl.focus({ preventScroll: true });
		}
		setTimeout(() => {
			if (inputEl) {
				inputEl.focus({ preventScroll: true });
			}
		}, 400);
	}

	function onInputClicked() {
		inputEl.focus({ preventScroll: true });
		isFocused = true;
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

	function onInput(event: InputEvent): void {
		const val = editedItem.itemDescription;
		if (getLineCount(val) > 1) {
			event.preventDefault();
			const lines = getLines(val);
			editedItem.itemDescription = lines[0] + lines[1];
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
			{ ...editedItem } as any as Proposition,
			...getFilteredPropositions(editedItem.itemDescription)
		];
		propositionsHighlightIndex = 0;
		if (shouldAutodetectCategory) {
			debounce(() => {
				const detected = categoryAutodetector.detect(editedItem.itemDescription);
				if (detected) {
					editedCategoryId = detected.id;
				} else {
					editedCategoryId = initialCategoryId;
				}
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

	function onCategoryUserInput(): void {
		shouldAutodetectCategory = false;
	}

	function onAddFormSubmit(): void {
		if (!isValidInput) {
			return;
		}
		let addCategory: CategoryOption = undefined;
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
		updateProposition(prop);
	}
</script>

<div
	on:submit|preventDefault={onAddFormSubmit}
	on:swiped-right={onAddFormSubmit}
	class="relative w-full"
>
	{#if isFirstTimeUse}
		<ChecklistEditorDemo on:next-click={focus} />
	{/if}
	<!--		Top row-->
	<div class="top flex h-9 mb-2">
		<div class="flex-1 h-full !p-0">
			<textarea
				class="resize-none focus:ring-0 single-line !bg-transparent form-input block !border-none disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 text-gray-900 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 p-1.5 text-sm"
				id="form-input"
				autocomplete="off"
				placeholder={$t('lists.details.add-item-placeholder')}
				rows="1"
				wrap="off"
				bind:value={editedItem.itemDescription}
				bind:this={inputEl}
				on:keyup|preventDefault={onDescriptionInputKeyUp}
				on:input={onInput}
				on:mousedown|preventDefault|stopPropagation={onInputClicked}
			/>
		</div>
		{#if isByCategoryView}
			<div class=" flex-0">
				<ChecklistItemCategoryInput
					addWrapClass="rounded"
					bind:categoryId={editedCategoryId}
					bind:categoryOptions
					bind:customCategoryInput
					on:user-input={onCategoryUserInput}
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
					in:fade
					on:mousedown|stopPropagation|preventDefault={() => onPropositionClick(proposition)}
					onmousedown={stopMouseEvent}
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
