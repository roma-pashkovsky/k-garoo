<script lang="ts">
	import { Button, Iconinput, Select } from 'flowbite-svelte';
	import type { CategoryOption } from '../types';
	import { customCategoryId } from '../utils/local-storage-state';
	import { onMount } from 'svelte';
	import { t } from '../utils/i18n.js';
	import { X } from 'svelte-heros';

	export let categoryId: string;
	export let customCategoryInput: string;
	export let categoryOptions: CategoryOption[];
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

<div class="!p-0 !inline-block w-full flex items-center">
	{#if isCustomCategoryOpen}
		<Iconinput
			noBorder
			id="custom-category"
			type="text"
			class="w-full foobar"
			iconClass="h-4 w-4 mr-2 dark:text-green-500"
			noBorderInputClass="inline-block !border-none w-full disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 p-2.5 text-sm"
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
			defaultClass="!border-none block w-full text-gray-900 bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-sm p-2.5"
			items={selectCategoryOptions}
			placeholder={$t('lists.create_new_list.set-category-to')}
			bind:value={categoryId}
			on:change={onCategorySelectChange}
		/>
	{/if}
</div>
