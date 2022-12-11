<script lang="ts">
	import { MagnifyingGlass, XMark } from 'svelte-heros-v2';
	import {
		createChecklistSearchIndices,
		searchValue
	} from '../../stores/checklist-main-list/checklist-search.store';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { debouncer } from '../../utils/debouncer';
	import { t } from '../../stores/app/translate';

	let open = false;
	const debounce = debouncer(300);
	let inputEl: HTMLInputElement;

	onMount(() => {
		if (get(searchValue)) {
			open = true;
		}
		if (inputEl) {
			const onMouseDownListener = (event: MouseEvent) => {
				event.stopPropagation();
				event.preventDefault();
				inputEl.focus({ preventScroll: true });
				inputEl.removeEventListener('mousedown', onMouseDownListener);
			};
			inputEl.addEventListener('mousedown', onMouseDownListener);
		}
	});

	function onToggleOpen(): void {
		open = !open;
		if (open) {
			createChecklistSearchIndices();
			setTimeout(() => {
				inputEl.focus({ preventScroll: true });
				setTimeout(() => {
					inputEl.focus({ preventScroll: true });
				}, 400);
			}, 100);
		} else {
			searchValue.set(null);
		}
	}

	function onBlur() {
		const onMouseDownListener = (event: MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
			inputEl.focus({ preventScroll: true });
			inputEl.removeEventListener('mousedown', onMouseDownListener);
		};
		inputEl.addEventListener('mousedown', onMouseDownListener);
	}

	function onSearchInput(event: any): void {
		debounce(() => searchValue.set(event.target.value));
	}
</script>

<div class="flex items-center space-x-2">
	<div class="w-56 {open ? '' : 'hidden'}">
		<input
			class="block w-full disabled:cursor-not-allowed disabled:opacity-50 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 p-2.5 text-sm rounded-lg"
			placeholder={$t('lists.search.input-placeholder')}
			value={$searchValue}
			bind:this={inputEl}
			on:input={onSearchInput}
			on:blur={onBlur}
		/>
	</div>
	<div class="w-[44px] h-[42px] flex items-center justify-center" on:click={onToggleOpen}>
		{#if open}
			<XMark />
		{:else}
			<MagnifyingGlass />
		{/if}
	</div>
</div>
