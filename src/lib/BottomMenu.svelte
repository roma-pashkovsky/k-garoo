<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let hidden = false;
	const dispatch = createEventDispatcher();

	function onSwipedLeft(): void {
		dispatch('swipe-left');
	}
</script>

<div
	on:swiped-left={onSwipedLeft}
	class="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-600 max-w-screen-lg px-2 sm:px-4 py-2"
>
	<slot />
</div>
