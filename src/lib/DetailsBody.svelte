<script lang="ts">
	import { press, swipe } from 'svelte-gestures';
	import { createEventDispatcher } from 'svelte';
	import { ToastService } from '../utils/toasts';
	import AppToast from './AppToast.svelte';

	const toastStore = ToastService.getInstance().toasts;
	$: toasts = $toastStore.filter((t) => t.type === 'details-top');
	export let noTopPadding = false;
	const dispatch = createEventDispatcher();

	function onBodyLongPress(): void {
		dispatch('body-long-press');
	}

	function onBodyClick(): void {
		dispatch('body-click');
	}

	function onBodySwipe(event: any): void {
		if (event.detail.direction === 'left') {
			dispatch('body-swipe-left');
		} else if (event.detail.direction === 'right') {
			dispatch('body-swipe-right');
		}
	}
</script>

<!--use:press={{ timeframe: 500, triggerBeforeFinished: true }}-->
<!--on:press={onBodyLongPress}-->
<div on:click={onBodyClick} class="flex-1 relative">
	<div
		use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-y' }}
		on:swipe={onBodySwipe}
		on:dblclick
		class="absolute top-0 bottom-0 left-0 right-0 px-4 sm:px-6 pb-20 overflow-y-auto {noTopPadding
			? 'pt-0'
			: 'pt-4'}"
	>
		<slot />
	</div>
</div>

<style>
	.toast-wrapper {
		position: absolute;
		top: 0.5rem;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		z-index: 50;
	}

	.toast:not(:last-child) {
		margin-bottom: 0.5rem;
	}
</style>
