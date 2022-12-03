<script lang="ts">
	import { Checkbox } from 'flowbite-svelte';
	import type { CheckListItemEditModel } from '../../types/index';
	import { createEventDispatcher, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import DuplicateBadge from './DuplicateBadge.svelte';
	import { Pencil } from 'svelte-heros-v2';

	export let disabled: boolean;
	export let item: CheckListItemEditModel;
	export let isCheckboxView: boolean;
	export let addClass: string;
	export let toBeDeleted: boolean;
	export let justChangedItemId: string | null;
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
				containerDiv.scrollIntoView({ block: 'end' });
			}
		}
	}

	onMount(() => {
		if (isJustChanged && containerDiv) {
			containerDiv.scrollIntoView({ block: 'end' });
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
	class="flex items-center overflow-hidden dark:text-gray-200"
	style="max-width: 70vw"
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
						class="mask absolute top-0 left-0 right-6 bottom-0"
						on:mousedown|preventDefault|stopPropagation={checkboxChanged}
						style="z-index: 1"
					/>
					<div
						class="item checkbox-wrapper flex items-center px-2 my-2 rounded {addClass} border border-blue-200"
					>
						<div class="mr-1 overflow-hidden h-6 w-6 flex items-center" in:slide>
							<Checkbox class="mr-2" checked={item.selected} />
						</div>
						<div class="w-fit text-base font-normal {item?.checked ? 'line-through' : ''}">
							{item?.itemDescription}
							<DuplicateBadge class="ml-3" show={item.isDuplicate || false} />
						</div>
					</div>
				</div>
				<div class="edit-icon ml-2" on:mousedown|preventDefault|stopPropagation={onItemEditPressed}>
					<Pencil class="w-4 h-4" />
				</div>
			</div>
		{:else}
			<div onmousedown="event.preventDefault(); event.stopPropagation();" class="pl-1">
				<div
					on:swiped-left
					on:swiped-right
					on:long-press={onItemLongPress}
					class="item py-1.5 px-2 my-2 rounded {addClass} {item?.checked
						? 'line-through'
						: ''} {isJustChanged ? 'ring-1 ring-blue-200' : ''}"
					on:mouseup|preventDefault|stopPropagation={onItemMouseDown}
					style="min-width: 120px; user-select: none"
					data-long-press-delay="300"
					ondblclick="event.stopPropagation();"
				>
					{item?.itemDescription}<DuplicateBadge class="ml-3" show={item.isDuplicate || false} />
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
