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

<div class="sticky flex justify-between items-center bg-white z-30 px-2 sm:px-4 pt-6">
	<div class="flex items-center">
		<Button color="white" class="!p-2">
			<ArrowLeft on:click={onBackClicked} class="w-25 h-25" />
		</Button>
	</div>
	<div class="flex items-center left" style="height: 25px">
		<h3 class="font-medium text-sm sm:text-2xl">
			<slot name="page-title" />
		</h3>
	</div>
	<div class="flex items-center right">
		<slot name="right-content" />
	</div>
</div>
