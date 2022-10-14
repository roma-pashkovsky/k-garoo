<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { ArrowLeft } from 'svelte-heros';
	import { createEventDispatcher } from 'svelte';
	export let noBottomPadding = false;

	const dispatch = createEventDispatcher();

	function onBackClicked(): void {
		dispatch('back-clicked');
	}
</script>

<div
	class="sticky flex justify-between items-center bg-white dark:bg-gray-900 z-30 px-2 sm:px-4 py-2.5 border-b border-gray-200 dark:border-gray-600 shadow-sm"
>
	<div class="flex items-center">
		<Button color="white" class="!p-1.5">
			<ArrowLeft size="24" on:click={onBackClicked} />
		</Button>
	</div>
	<div class="flex items-center left flex-1 mx-2 sm:mx-4">
		<div class="font-medium text-base sm:text-2xl inline-block w-full">
			<slot name="page-title" />
		</div>
	</div>
	<div class=" right">
		<slot class="flex items-center" name="right-content" />
	</div>
</div>
