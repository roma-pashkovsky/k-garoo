<script lang="ts">
	import { press, swipe } from 'svelte-gestures';
	import { Checkbox } from 'flowbite-svelte';
	import type { CheckListItemEditModel } from '../../types/index';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';

	export let item: CheckListItemEditModel;
	export let isCheckboxView: boolean;
	export let addClass: string;
	const dispatch = createEventDispatcher();

	function checkboxChanged(): void {
		dispatch('checkbox-change');
	}
</script>

<div
	use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-y' }}
	on:swipe
	class="flex items-center"
>
	<!--	use:press={{ timeframe: 400, triggerBeforeFinished: true }}-->
	<!--	use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-y' }}-->
	<div
		use:press={{ timeframe: 400, triggerBeforeFinished: true }}
		on:click
		on:dblclick
		on:mousedown
		on:mouseup
		on:press|stopPropagation
		class="p-2 my-2 rounded {addClass}"
		onclick="event.stopPropagation()"
		ondblclick="event.stopPropagation()"
		onmousedown=""
	>
		{#if isCheckboxView}
			<div onclick="event.stopPropagation()" onmouseup="event.stopPropagation()" class="relative">
				<div class="mask absolute top-0 left-0 right-0 bottom-0" on:click={checkboxChanged} />
				<div class="checkbox-wrapper flex items-center">
					<div class="mr-1 overflow-hidden h-6 w-6 flex items-center" in:slide>
						<Checkbox class="mr-2" checked={item.selected} />
					</div>
					<div class="text-base font-normal {item?.checked ? 'line-through' : ''}">
						{item?.itemDescription}
					</div>
				</div>
			</div>
		{:else}
			<div class={item?.checked ? 'line-through' : ''}>{item?.itemDescription}</div>
		{/if}
	</div>
</div>
