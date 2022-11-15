<script lang="ts">
	import { swipe } from 'svelte-gestures';
	import { createEventDispatcher } from 'svelte';
	import { doubleTap } from '../utils/double-tap';

	// export let noTopPadding = false;
	const dispatch = createEventDispatcher();

	function onBodyClick(): void {
		dispatch('body-click');
	}

	function onBodySwipeLeft(event: any): void {
		dispatch('body-swipe-left');
	}

	function onBodySwipeRight(event: any): void {
		dispatch('body-swipe-right');
	}
</script>

<div
	on:click={onBodyClick}
	on:swiped-right={onBodySwipeRight}
	on:swiped-left={onBodySwipeLeft}
	on:dblclick
	use:doubleTap
	on:dbltap|preventDefault|stopPropagation
	on:focus
	class="flex-1 relative select-none"
>
	<div class="absolute top-0 bottom-0 left-0 right-0 overflow-y-auto px-4 md:px-8 pb-40 pt-4">
		<slot />
	</div>
	<slot name="float" />
</div>
