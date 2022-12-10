<script lang="ts">
	import { Checkbox } from 'flowbite-svelte';
	import type { CheckListItemEditModel, Theme } from '../../types/index';
	import { createEventDispatcher, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import DuplicateBadge from './DuplicateBadge.svelte';
	import { Pencil } from 'svelte-heros-v2';
	import ChecklistItemCheckAnimate from './ChecklistItemCheckAnimate.svelte';

	export let disabled: boolean;
	export let item: CheckListItemEditModel;
	export let isCheckboxView: boolean;
	export let addClass: string;
	export let toBeDeleted: boolean;
	export let justChangedItemId: string | null;
	export let theme: Theme;
	const dispatch = createEventDispatcher();

	$: isJustChanged = justChangedItemId === item?.id;

	let containerDiv: HTMLDivElement;
	let prevToBeDeleted: boolean;

	$: {
		// apply remove animation
		if (toBeDeleted === true && toBeDeleted !== prevToBeDeleted) {
			const actualHeight = '' + containerDiv.getBoundingClientRect().height + 'px';
			containerDiv.style.height = actualHeight;
			containerDiv.style.transition = 'height 0.3s ease-out';
			setTimeout(() => {
				containerDiv.style.height = '0px';
			});
			prevToBeDeleted = true;
		}

		// highlight just changed item
		if (justChangedItemId === item?.id) {
			if (containerDiv) {
				containerDiv.scrollIntoView({ block: 'center' });
			}
		}
	}

	onMount(() => {
		if (isJustChanged && containerDiv) {
			containerDiv.scrollIntoView({ block: 'center' });
		}
	});

	function checkboxChanged(): void {
		if (disabled) return;
		dispatch('checkbox-change');
	}

	function onItemMouseDown(): void {
		if (disabled) return;
		dispatch('item-click');
	}

	function onItemLongPress(): void {
		if (disabled) return;
		dispatch('item-long-press');
	}

	function onItemEditPressed(): void {
		if (disabled) return;
		dispatch('item-edit-pressed');
	}
</script>

<div
	bind:this={containerDiv}
	class="flex items-center overflow-hidden dark:text-gray-200 pl-0.5"
	style="max-width: 75vw"
>
	<div>
		{#if isCheckboxView}
			<div
				class="flex items-center"
				onmousedown="event.preventDefault(); event.stopPropagation()"
				ondblclick="event.stopPropagation()"
			>
				<div class="relative">
					<div
						class="mask absolute top-0 left-0 right-3 bottom-0"
						on:mousedown|preventDefault|stopPropagation={checkboxChanged}
						style="z-index: 1"
					/>
					<div
						class="item checkbox-wrapper flex items-center pl-0.5 pr-2 py-1.5 space-x-1 my-2 rounded ring-1 ring-blue-200"
					>
						<div class="overflow-hidden h-[30px] w-[25px] flex items-center justify-center">
							<Checkbox checked={item.selected} />
						</div>
						<div
							class="px-1 w-fit text-base font-normal rounded {item?.checked
								? 'line-through'
								: ''} {addClass}"
						>
							{item?.itemDescription}
							<DuplicateBadge class="ml-3" show={item.isDuplicate || false} />
						</div>
					</div>
				</div>
				<div class="edit-icon ml-2" on:mousedown|preventDefault|stopPropagation={onItemEditPressed}>
					<Pencil class="w-5 h-4" />
				</div>
			</div>
		{:else}
			<div onmousedown="event.preventDefault(); event.stopPropagation();">
				<div
					on:swiped-left
					on:swiped-right
					on:long-press={onItemLongPress}
					class="flex items-start space-x-1 item py-1.5 pl-0.5 pr-2 my-2 rounded {item?.checked
						? 'line-through'
						: ''}"
					on:mouseup|preventDefault|stopPropagation={onItemMouseDown}
					style="min-width: 120px; user-select: none"
					data-long-press-delay="400"
					ondblclick="event.stopPropagation();"
				>
					<div class="h-[30px] w-[25px] overflow-hidden flex items-center">
						<ChecklistItemCheckAnimate {theme} checked={item.checked} />
					</div>
					<div class="flex-1 px-1 rounded {isJustChanged ? 'ring-1 ring-blue-200' : ''} {addClass}">
						{item?.itemDescription}<DuplicateBadge class="ml-3" show={item.isDuplicate || false} />
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.item {
		min-height: 36px;
	}
</style>
