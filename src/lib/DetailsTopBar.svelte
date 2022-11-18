<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { ArrowLeft } from 'svelte-heros';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function onBackClicked(): void {
		dispatch('back-clicked');
	}
</script>

<div
	class="sticky  bg-white dark:bg-gray-900 z-30 px-2 sm:px-4 py-2.5 border-b border-gray-200 dark:border-gray-600 shadow-sm"
	style="contain: layout style"
>
	<div class="top flex justify-between items-center">
		<div class="flex items-center">
			<Button on:click={onBackClicked} color="light" class="!p-1.5 !border-none ">
				<ArrowLeft size="24" />
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
	<div class="bottom">
		<slot name="bottom" />
	</div>
</div>
