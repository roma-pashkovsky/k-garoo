<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { ArrowRight, DocumentRemove } from 'svelte-heros';
	import ChecklistItemCategoryInput from './ChecklistItemCategoryInput.svelte';
	import { createEventDispatcher } from 'svelte';
	import { customCategoryId } from '../../utils/local-storage-state';
	import type { CategoryOption } from '../../types';
	import type { ChangeCategoryEvent } from '../../types/checklist-details';
	import { DocumentDuplicate, DocumentPlus } from 'svelte-heros-v2';
	import { swipe } from 'svelte-gestures';
	import { throttler } from '../../utils/throttler';
	import { fly } from 'svelte/transition';
	import { t } from '../../stores/app/translate';
	import { stopMouseEvent } from '../../utils/stop-mouse-event.js';

	export let isByCategoryView: boolean;
	export let categoryOptions: CategoryOption[];
	let changeCategoryId: string;
	let customCategoryInput: string;
	const dispatch = createEventDispatcher();
	const throttle = throttler(300);

	function onRemoveClicked(): void {
		dispatch('batch-remove');
	}

	function onSaveAsNewList(): void {
		dispatch('batch-save-new-list');
	}

	function onChangeCategoryThrottled(): void {
		throttle(() => onChangeCategory());
	}

	function onCopyItems(): void {
		dispatch('batch-copy-items');
	}

	function onChangeCategory(): void {
		if (!changeCategoryId) {
			return;
		}
		if (changeCategoryId === customCategoryId && !customCategoryInput?.length) {
			return;
		}
		let data: ChangeCategoryEvent = {
			categoryId: undefined,
			newCategory: undefined
		};
		if (changeCategoryId === customCategoryId) {
			data.newCategory = {
				id: '' + new Date().getTime(),
				name: customCategoryInput
			} as CategoryOption;
		} else {
			data.categoryId = changeCategoryId;
		}
		dispatch('batch-change-category', data);
		if (data.newCategory) {
			changeCategoryId = data.newCategory.id;
		} else {
			changeCategoryId = data.categoryId as string;
		}
	}

	function onCategorySwipe(event: any): void {
		if (event.detail.direction === 'right') {
			onChangeCategory();
		}
	}
</script>

<div
	in:fly={{ y: 100 }}
	out:fly={{ y: 100 }}
	class="grid grid-cols-2 md:grid-cols-4 grid-rows-2 sm:grid-rows-1"
	onclick={stopMouseEvent}
>
	<button
		on:click={onRemoveClicked}
		class="mr-2 !p-1.5 text-sm flex-1 sm:flex-auto  flex flex-col items-center mb-2 rounded"
	>
		<DocumentRemove />
		<span class="whitespace-nowrap">{$t('lists.details.batch-remove-button')}</span>
	</button>
	<button
		on:click={onSaveAsNewList}
		class="sm:mr-2 action !p-1.5 text-sm flex-1 sm:flex-auto flex flex-col items-center mb-2 rounded"
	>
		<DocumentPlus />
		<span class="whitespace-nowrap">{$t('lists.details.move-to-new-list')}</span>
	</button>
	<button
		on:click={onCopyItems}
		class="sm:mr-2 action !p-1.5 text-sm flex-1 sm:flex-auto flex flex-col items-center mb-2 rounded"
	>
		<DocumentDuplicate />
		<span class="whitespace-nowrap">{$t('lists.details.copy-items')}</span>
	</button>
	{#if isByCategoryView}
		<form
			on:submit|preventDefault={onChangeCategoryThrottled}
			class="col-span-1 flex items-center justify-center mb-2 rounded px-2"
			style="height: 56px;"
			use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-y' }}
			on:swipe={onCategorySwipe}
		>
			<div style="min-width: 200px;">
				<ChecklistItemCategoryInput
					{categoryOptions}
					addWrapClass="!rounded-l"
					fullWidth={true}
					bind:categoryId={changeCategoryId}
					bind:customCategoryInput
				/>
			</div>

			<Button type="submit" color="blue" class="!py-1.5 !px-1 !rounded-r !rounded-l-none"
				><ArrowRight /></Button
			>
		</form>
	{/if}
</div>

<style>
</style>
