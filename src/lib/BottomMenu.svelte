<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CloseButton } from 'flowbite-svelte';

	export let hidden = false;
	export let isCloseBtn: boolean;
	const dispatch = createEventDispatcher();

	function onSwipedLeft(): void {
		dispatch('swipe-left');
	}

	function onCloseClick(): void {
		dispatch('close-click');
	}
</script>

<div
	on:swiped-left={onSwipedLeft}
	class="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-600 max-w-screen-lg px-2 sm:px-4 py-2 relative flex"
>
	<div class="flex-1">
		<slot />
	</div>
	{#if isCloseBtn}
		<div>
			<CloseButton on:click={onCloseClick} />
		</div>
	{/if}
</div>
