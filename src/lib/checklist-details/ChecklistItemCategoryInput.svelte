<script lang="ts">
	import { Iconinput, Select } from 'flowbite-svelte';
	import type { CategoryOption } from '../../types';
	import { customCategoryId } from '../../utils/local-storage-state';
	import { onMount } from 'svelte';
	import { t } from '../../utils/i18n.js';
	import { X } from 'svelte-heros';

	export let categoryId: string;
	export let customCategoryInput: string;
	export let categoryOptions: CategoryOption[];
	export let fullWidth: boolean;
	let prevCategoryId = categoryId;

	$: selectCategoryOptions = categoryOptions.map((o) => ({ name: o.name, value: o.id }));
	$: isCustomCategoryOpen = categoryId === customCategoryId;

	onMount(() => {
		prevCategoryId = categoryId;
	});

	function onCategorySelectChange() {
		if (categoryId !== customCategoryId) {
			prevCategoryId = categoryId;
		} else {
			customCategoryInput = '';
		}
	}

	function onCloseCustomCategoryInput(): void {
		categoryId = prevCategoryId;
	}
</script>

<div
	class="!p-0 inline-block dark:bg-gray-800 items-center input-wrapper {isCustomCategoryOpen
		? 'custom-open'
		: ''} {fullWidth ? 'w-full' : ''}"
>
	{#if isCustomCategoryOpen}
		<Iconinput
			noBorder
			id="custom-category"
			type="text"
			class="w-full foobar"
			iconClass="h-4 w-4 mr-2 dark:text-green-500"
			noBorderInputClass="h-9 inline-block !border-none w-full disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none focus:bg-blue-100 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 p-2.5 text-sm"
			placeholder={$t('lists.create_new_list.my-category')}
			pointerEvent={true}
			autofocus
			autocomplete="off"
			bind:value={customCategoryInput}
		>
			<X on:click={onCloseCustomCategoryInput} />
		</Iconinput>
	{:else}
		<Select
			defaultClass="!py-0 !border-none !bg-transparent block w-full h-9 text-gray-900 bg-gray-50 border-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white text-sm"
			class="focus:outline-none focus:!shadow-none focus:!border-none focus:!ring-0 !bg-transparent"
			items={selectCategoryOptions}
			placeholder={$t('lists.create_new_list.set-category-to')}
			bind:value={categoryId}
			on:change={onCategorySelectChange}
		/>
	{/if}
</div>

<style>
	.input-wrapper:not(.w-full) {
		max-width: 140px;
	}

	.input-wrapper:not(.w-full).custom-open {
		max-width: 152px;
	}
</style>
