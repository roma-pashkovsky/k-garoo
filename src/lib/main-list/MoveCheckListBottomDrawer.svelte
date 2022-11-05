<script lang="ts">
	import { CloseButton, Drawer } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { sineIn } from 'svelte/easing';
	import type { MainListItem } from '../../types';
	import { derived, writable } from 'svelte/store';
	import { listDataStore } from '../../stores/checklist-details/checklist-details-data';
	import { t } from '../../stores/app/translate';

	export let movedChecklist: MainListItem | null;
	const dispatch = createEventDispatcher();
	const transitionParamsBottom = {
		y: 320,
		duration: 200,
		easing: sineIn
	};
	let hidden = true;
	const movedChecklistId = writable<string | null>(null);
	const movedListData = derived(
		[listDataStore, movedChecklistId],
		([$listDataStore, $movedChecklistId]) => {
			if ($movedChecklistId) {
				return $listDataStore[movedChecklist?.id];
			} else {
				return null;
			}
		}
	);

	$: {
		movedChecklistId.set(movedChecklist?.id);
		hidden = !movedChecklist;
	}

	function onDrawerClose(): void {
		dispatch('drawer-close');
	}
</script>

<Drawer
	placement="bottom"
	width="w-full"
	transitionType="fly"
	transitionParams={transitionParamsBottom}
	backdrop={false}
	divClass="foo flex justify-center z-40"
	bind:hidden
	id="sidebar8"
>
	{#if movedChecklist}
		<div
			class="w-full max-w-screen-lg bg-white dark:bg-black px-8 pt-4 z-40 h-20 flex justify-between items-start"
			style="-webkit-box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.67);
-moz-box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.67);
box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.67);"
		>
			<h5 id="drawer-label" class="mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
				{$t('list.move.drawer-label')} "{$movedListData?.name}"...
			</h5>
			<CloseButton on:click={onDrawerClose} class="mb-4 dark:text-white" />
		</div>
	{/if}
</Drawer>
