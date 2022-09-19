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

<div class="sticky flex justify-between items-center bg-white dark:bg-black z-30 px-2 sm:px-4 pt-4">
	<div class="flex items-center">
		<Button color="white" class="!p-2">
			<ArrowLeft on:click={onBackClicked} class="w-25 h-25" />
		</Button>
	</div>
	<div class="flex items-center left flex-1 ml-2 sm:ml-4" style="height: 25px">
		<h3 class="font-medium text-base sm:text-2xl">
			<slot name="page-title" />
		</h3>
	</div>
	<div class=" right">
		<slot class="flex items-center" name="right-content" />
	</div>
</div>
