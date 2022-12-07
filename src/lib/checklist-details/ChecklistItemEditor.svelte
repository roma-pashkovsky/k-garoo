<script lang="ts">
	import type { CategoryOption, CheckListItem, Proposition } from '../../types';
	import type { FuzzySearch } from '../../utils/fuzzy-search';
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
	import { Play, XMark } from 'svelte-heros-v2';
	import { forceIncludeCategoryOptions } from '../../stores/checklist-details/category-options-for-checklist';

	export let editedItem: CheckListItem;
	export let editedCategoryId: string;
	export let isByCategoryView: boolean;
	export let categoryOptions: CategoryOption[];
	export let propositionsFuzzySearch: FuzzySearch<Proposition>;
	export let categoryAutodetector: CategoryAutodetector;
	export let isFirstTimeUse: boolean;
	export let shouldAutodetectCategory = true;

	const dispatch = createEventDispatcher();
	let inputEl: HTMLTextAreaElement;
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
		forceIncludeCategoryOptions.set([]);
		const onMouseDownListener = (event: MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
			inputEl.focus({ preventScroll: true });
			inputEl.removeEventListener('mousedown', onMouseDownListener);
		};
		inputEl.addEventListener('mousedown', onMouseDownListener);
		focus();
	});

	onDestroy(() => {
		dispatch('destroy');
		forceIncludeCategoryOptions.set([]);
	});

	function focus() {
		if (inputEl) {
			inputEl.focus({ preventScroll: true });
		}
		setTimeout(() => {
			if (inputEl) {
				inputEl.focus({ preventScroll: true });
			}
		}, 200);
	}

	function onInputBlur() {
		const onMouseDownListener = (event: MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
			inputEl.focus({ preventScroll: true });
			inputEl.removeEventListener('mousedown', onMouseDownListener);
		};
		inputEl.addEventListener('mousedown', onMouseDownListener);
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
			...getFilteredPropositions(editedItem.itemDescription, 3)
		];
		propositionsHighlightIndex = 0;
		if (shouldAutodetectCategory) {
			debounce(() => {
				const detected = categoryAutodetector.detect(editedItem.itemDescription);
				if (detected) {
					editedCategoryId = detected.id;
					forceIncludeCategoryOptions.set([detected]);
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
		forceIncludeCategoryOptions.set([prop.category]);
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

	function getFilteredPropositions(editedItemDesc: string, lim: number): Proposition[] {
		if (!editedItemDesc?.length) {
			return [];
		}
		if (!propositionsFuzzySearch) {
			return [];
		}
		const res = propositionsFuzzySearch.search(editedItemDesc).map((r) => r.item);
		if (res.length < lim) {
			return res;
		} else {
			return res.slice(0, lim);
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

	function onCloseClick(): void {
		dispatch('dismiss');
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
	<div class="top flex h-11 justify-between items-start">
		<textarea
			class="flex-1 resize-none focus:ring-0 single-line !bg-transparent form-input block !border-none disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 text-gray-900 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 p-1.5 text-sm"
			id="form-input"
			autocomplete="off"
			placeholder={$t('lists.details.add-item-placeholder')}
			bind:value={editedItem.itemDescription}
			bind:this={inputEl}
			on:keyup|preventDefault={onDescriptionInputKeyUp}
			on:input={onInput}
			on:blur={onInputBlur}
		/>
		<div class="ml-2 flex">
			<!--		Category input-->
			{#if isByCategoryView}
				<ChecklistItemCategoryInput
					addWrapClass="rounded-lg h-8"
					bind:categoryId={editedCategoryId}
					bind:categoryOptions
					bind:customCategoryInput
					on:user-input={onCategoryUserInput}
				/>
			{/if}
			<!--			/Category input-->
			<button
				on:mousedown|preventDefault|stopPropagation={onCloseClick}
				class="!p-1.5 w-8 h-8 ml-2 border border-gray-200 dark:border-gray-600 flex items-center justify-center rounded-lg"
			>
				<XMark size="18" />
			</button>
		</div>
	</div>
	<!--		Bottom row-->
	<div class="bottom flex justify-between  relative max-w-full">
		<!--			Propositions-->
		<div class="flex h-9 items-center w-full" style="max-width: calc(100vw - 100px)">
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
		<div class="bottom-right flex">
			<!--			Submit button-->
			<button
				type="submit"
				disabled={!isValidInput}
				on:mousedown|preventDefault|stopPropagation={onAddFormSubmit}
				class="!p-1.5 w-8 h-8 ml-3 rounded-lg flex items-center justify-center {isValidInput
					? 'bg-blue-600 text-white'
					: 'border border-blue-400 text-gray-500'}"
			>
				<Play variation="solid" size="16" />
			</button>
		</div>
	</div>
</div>

<style>
	.prop-item {
		max-width: 30%;
	}
	.prop-item.single {
		max-width: 95%;
	}
	.prop-item.two-fold {
		max-width: 45%;
	}
</style>
