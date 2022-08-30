<script lang="ts">
	import { Card, Button } from 'flowbite-svelte';
	import { Plus } from 'svelte-heros';
	import { goto } from '$app/navigation';
	export let cards = [1, 2, 3, 4, 5, 6];

	export function onAddButtonClicked(): void {
		goto('/home/lists/create');
	}
</script>

<div class="p-8">
	<Button on:click={onAddButtonClicked} class="!p-2" o><Plus class="w-8 h-8" /></Button>
</div>
<div class="min-h-screen flex items-center justify-center">
	<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
		{#each cards as card}
			<Card href="lists/{card}">
				<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
					Noteworthy technology acquisitions 2021
				</h5>
				<p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
					Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse
					chronological order.
				</p>
			</Card>
		{/each}
	</div>
</div>
