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

	function onSwipedLeft(): void {
		dispatch('swipe-left');
	}
</script>

<div
	on:swiped-left={onSwipedLeft}
	class="fixed bottom-0 left-0 right-0 items-center z-20 flex justify-center {hidden
		? 'hidden'
		: ''}"
>
	<div
		class="h-full bg-white dark:bg-black border-t border-gray-200 dark:border-gray-600 w-full max-w-screen-lg px-2 sm:px-4 py-2"
	>
		<slot />
	</div>
</div>
