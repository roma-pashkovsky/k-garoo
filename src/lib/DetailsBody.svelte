<script lang="ts">
	import { swipe } from 'svelte-gestures';
	import { createEventDispatcher } from 'svelte';
	import { doubleTap } from '../utils/double-tap';

	export let noTopPadding = false;
	const dispatch = createEventDispatcher();

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
		use:doubleTap
		on:dbltap
		class="select-none absolute top-0 bottom-0 left-0 right-0 px-4 md:px-8 pb-36 overflow-y-auto {noTopPadding
			? 'pt-0'
			: 'pt-4'}"
	>
		<slot />
	</div>
	<slot name="float" />
</div>
