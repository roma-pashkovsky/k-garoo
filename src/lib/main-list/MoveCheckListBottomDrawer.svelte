<script lang="ts">
	import { CloseButton, Drawer } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { sineIn } from 'svelte/easing';
	import type { MainListItem } from '../../types';
	import { derived, writable } from 'svelte/store';
	import { listDataStore } from '../../stores/checklist-details/checklist-details-data';
	import { t } from '../../stores/app/translate';
	import BottomMenu from '../BottomMenu.svelte';

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
		<BottomMenu isCloseBtn={true} on:close-click={onDrawerClose}>
			<h5
				id="drawer-label"
				class="mb-4 text-base font-semibold text-gray-500 dark:text-gray-400 h-10"
			>
				{$t('list.move.drawer-label')} "{$movedListData?.name}"...
			</h5>
		</BottomMenu>
	{/if}
</Drawer>
