<script lang="ts">
	import { press, swipe } from 'svelte-gestures';
	import { Checkbox } from 'flowbite-svelte';
	import type { CheckListItemEditModel } from '../../types/index';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import DuplicateBadge from './DuplicateBadge.svelte';

	export let item: CheckListItemEditModel;
	export let isCheckboxView: boolean;
	export let addClass: string;
	export let toBeDeleted: boolean;
	export let isLightBg: boolean;
	const dispatch = createEventDispatcher();

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
	}

	function checkboxChanged(): void {
		dispatch('checkbox-change');
	}

	function onItemMouseDown(): void {
		dispatch('item-click');
	}

	function onItemLongPress(): void {
		dispatch('item-long-press');
	}
</script>

<div
	bind:this={containerDiv}
	class=" flex items-center overflow-hidden {isLightBg ? 'dark:text-black' : 'dark:text-white'}"
>
	<div>
		{#if isCheckboxView}
			<div
				class="relative"
				onmousedown="event.preventDefault(); event.stopPropagation()"
				ondblclick="event.stopPropagation()"
			>
				<div
					class="mask absolute top-0 left-0 right-0 bottom-0 z-10"
					on:mousedown={checkboxChanged}
				/>
				<div
					class="item checkbox-wrapper flex items-center p-2 my-2 rounded {addClass} border border-blue-300"
				>
					<div class="mr-1 overflow-hidden h-6 w-6 flex items-center" in:slide>
						<Checkbox class="mr-2" checked={item.selected} />
					</div>
					<div class="text-base font-normal {item?.checked ? 'line-through' : ''}">
						{item?.itemDescription}
						<DuplicateBadge class="ml-3" show={item.isDuplicate} />
					</div>
				</div>
			</div>
		{:else}
			<div>
				<div
					use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-y' }}
					on:swipe
					use:press={{ timeframe: 400, triggerBeforeFinished: true }}
					on:press={onItemLongPress}
					class="item py-1.5 px-2 my-2 rounded {addClass} {item?.checked ? 'line-through' : ''}"
					on:mouseup|preventDefault|stopPropagation={onItemMouseDown}
					style="min-width: 120px;"
					onmousedown="event.preventDefault(); event.stopPropagation();"
					ondblclick="event.stopPropagation();"
				>
					{item?.itemDescription}<DuplicateBadge class="ml-3" show={item.isDuplicate} />
				</div>
			</div>
		{/if}
	</div>
</div>
