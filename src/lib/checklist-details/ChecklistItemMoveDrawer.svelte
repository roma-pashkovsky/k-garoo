<script lang="ts">
	import { sineIn } from 'svelte/easing';
	import { CloseButton, Drawer } from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { moveChecklistItemsEvent } from '../../stores/checklist-details/move-checklist-items';
	import { closeMoveChecklistItems } from '../../stores/checklist-details/move-checklist-items.js';
	import type { Unsubscriber } from 'svelte/store';
	import { derived } from 'svelte/store';
	import { t } from '../../stores/app/translate';
	import { click_outside } from '../../utils/click-outside';
	import ChecklistItemMove from './ChecklistItemMove.svelte';

	const items = derived(moveChecklistItemsEvent, (event$) => event$?.items);
	const transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};
	let moveItemsDrawerHidden = true;
	let unsub: Unsubscriber;

	onMount(() => {
		unsub = moveChecklistItemsEvent.subscribe((ev) => {
			moveItemsDrawerHidden = !ev;
		});
	});

	onDestroy(() => {
		if (unsub) {
			unsub();
		}
	});
</script>

<Drawer
	transitionType="fly"
	{transitionParams}
	bind:hidden={moveItemsDrawerHidden}
	position="fixed"
	placement="right"
	class="w-80"
	id="share-drawer"
>
	<div use:click_outside on:click_outside={closeMoveChecklistItems} class="absolute inset-4">
		<div class="flex items-center" style="padding-top: env(safe-area-inset-top)">
			<h5
				id="drawer-label"
				class="inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
			>
				{$t('move-checklist-items.drawer-title')}
			</h5>
			<CloseButton on:click={closeMoveChecklistItems} class="mb-4 dark:text-white" />
		</div>
		{#if !moveItemsDrawerHidden}
			<ChecklistItemMove items={$items} />
		{/if}
	</div>
</Drawer>
