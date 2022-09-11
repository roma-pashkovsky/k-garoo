<script lang="ts">
	import { Button, ButtonGroup, Dropdown, DropdownItem, Input, Popover } from 'flowbite-svelte';
	import type { CheckListItem, Proposition } from '../../types';
	import { ArrowRight, X } from 'svelte-heros';
	import { createEventDispatcher, onMount } from 'svelte';
	export let item: CheckListItem;
	export let items: CheckListItem[];
	export let propositionsFuzzySearch: any;
	let formEl: HTMLElement;
	let inputEl: HTMLInputElement;
	let isInputDirty: boolean;
	const dispatch = createEventDispatcher();

	$: propositions = getPropositions(propositionsFuzzySearch, item.itemDescription);
	$: isShowPropositions = !!propositions?.length && !!isInputDirty;
	$: inputId = 'input-' + item.id;
	onMount(() => {
		inputEl = formEl.querySelector('#' + 'form-input');
		if (inputEl) {
			setTimeout(() => {
				inputEl.focus({ preventScroll: false });
				inputEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 200);
		}
	});
	function getPropositions(fuzzySearch: any, description: string): Proposition[] {
		if (fuzzySearch) {
			const result = fuzzySearch.search(description).map((s) => s.item);
			return result.slice(0, Math.min(result.length, 3));
		} else {
			return [];
		}
	}

	function handleInputSubmit(id: string): void {
		dispatch('input-submit');
	}

	function onInput() {
		isInputDirty = true;
	}

	function handleInputBlur(id: string) {
		dispatch('input-blur');
	}

	function handleInputClear(id: string) {
		dispatch('input-clear');
	}

	function handlePropositionClick(prop: Proposition): void {
		dispatch('proposition-click', prop);
	}
</script>

<form
	bind:this={formEl}
	class="w-full relative"
	on:submit|preventDefault={() => handleInputSubmit(item.id)}
>
	{#if isShowPropositions}
		<div class="absolute bottom-12 shadow-md rounded w-80 bg-blue-100 z-20">
			{#each propositions as proposition}
				<div
					on:click|stopPropagation={() => handlePropositionClick(proposition)}
					class="rounded flex w-80 justify-between p-3 hover:bg-gray-50"
				>
					<div>
						{proposition.itemDescription}
					</div>
					<div>{proposition?.category?.name}</div>
				</div>
			{/each}
		</div>
	{/if}
	<ButtonGroup class="relative !w-full">
		<Button id="poptrigger" class="!p-0 flex-1">
			<Input
				inputClass="form-input block w-full border disabled:cursor-not-allowed disabled:opacity-50 rounded-l-lg bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 p-2.5 text-sm flex-1"
				id="form-input"
				autocomplete="off"
				autofocus
				style="box-sizing: border-box; width: 100%"
				on:blur={() => handleInputBlur(item.id)}
				on:keyup={onInput}
				type="text"
				bind:value={item.itemDescription}
			/>
		</Button>
		<Button type="submit" class="!p-2" color="blue">
			<ArrowRight />
		</Button>
	</ButtonGroup>
</form>
