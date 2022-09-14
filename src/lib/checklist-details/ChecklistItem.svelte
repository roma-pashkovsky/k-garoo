<script lang="ts">
	import { press, swipe } from 'svelte-gestures';
	import { Badge, Checkbox, Tooltip } from 'flowbite-svelte';
	import type { CheckListItemEditModel } from '../../types/index';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { t } from '../../utils/i18n.js';

	export let item: CheckListItemEditModel;
	export let isCheckboxView: boolean;
	export let addClass: string;
	const dispatch = createEventDispatcher();

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

<div class="flex items-center">
	<div class="p-2 my-2 rounded {addClass}">
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
			<div
				onmousedown="event.preventDefault(); event.stopPropagation()"
				ondblclick="event.stopPropagation()"
			>
				<div
					use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-y' }}
					on:swipe
					use:press={{ timeframe: 400, triggerBeforeFinished: true }}
					class={item?.checked ? 'line-through' : ''}
					on:press={onItemLongPress}
					on:mouseup|preventDefault|stopPropagation={onItemMouseDown}
				>
					{item?.itemDescription}
				</div>
			</div>
		{/if}
	</div>
	{#if item.isDuplicate}
		<div class="inline-block ml-2">
			<Badge id="badge" color="yellow">!</Badge>
			<Tooltip trigger="click" triggeredBy="#badge"
				>{$t('lists.details.duplicate-item-badge')}</Tooltip
			>
		</div>
	{/if}
</div>
