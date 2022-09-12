<script lang="ts">
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import { ArrowRight, DocumentRemove } from 'svelte-heros';
	import ChecklistItemCategoryInput from './ChecklistItemCategoryInput.svelte';
	import { createEventDispatcher } from 'svelte';
	import { customCategoryId } from '../../utils/local-storage-state';
	import type { CategoryOption } from '../../types';
	import type { ChangeCategoryEvent } from '../../types/checklist-details';
	import { ChevronLeft } from 'svelte-heros-v2';
	import { swipe } from 'svelte-gestures';

	export let isByCategoryView: boolean;
	export let categoryOptions: CategoryOption[];
	let changeCategoryId: string;
	let customCategoryInput: string;
	const dispatch = createEventDispatcher();

	function onRemoveClicked(): void {
		dispatch('batch-remove');
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
			changeCategoryId = data.categoryId;
		}
	}

	function onCategorySwipe(event: any): void {
		if (event.detail.direction === 'right') {
			onChangeCategory();
		}
	}
</script>

<div onclick="event.stopPropagation()">
	<form on:submit|preventDefault={onChangeCategory}>
		<ButtonGroup class="!w-full">
			<Button class="!py-2 !px-1" on:click={() => dispatch('dismiss')}>
				<ChevronLeft />
			</Button>
			<Button on:click={onRemoveClicked} class="!pt-2 !pb-2">
				<DocumentRemove />
			</Button>
			{#if isByCategoryView}
				<Button class="!p-0 flex-1">
					<div
						class="w-full"
						use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-y' }}
						on:swipe={onCategorySwipe}
					>
						<ChecklistItemCategoryInput
							class="flex-1"
							{categoryOptions}
							fullWidth={true}
							bind:categoryId={changeCategoryId}
							bind:customCategoryInput
						/>
					</div>
				</Button>
				<Button type="submit" on:click={onChangeCategory} color="blue" class="!py-2 !px-1"
					><ArrowRight />
				</Button>
			{/if}
		</ButtonGroup>
	</form>
</div>
