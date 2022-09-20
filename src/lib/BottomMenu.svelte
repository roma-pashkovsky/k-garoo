<script lang="ts">
	import { swipe } from 'svelte-gestures';
	import { createEventDispatcher } from 'svelte';

	export let hidden: boolean;
	const dispatch = createEventDispatcher();

	function onSwipe(event) {
		if (event.detail.direction === 'left') {
			dispatch('swipe-left');
		}
		if (event.detail.direction === 'right') {
			dispatch('swipe-right');
		}
	}
</script>

<div
	use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-y' }}
	on:swipe={onSwipe}
	class="fixed bottom-0 left-0 right-0 bg-white dark:bg-black px-2 sm:px-4 py-2 items-center z-20 border-t border-gray-200 dark:border-gray-600 shadow-md {hidden
		? 'hidden'
		: ''}"
>
	<slot />
</div>
