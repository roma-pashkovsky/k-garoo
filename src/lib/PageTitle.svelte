<script lang="ts">
	import { Button, Heading } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { ArrowLeft } from 'svelte-heros-v2';

	export let backButton: boolean;

	const dispatch = createEventDispatcher();

	function onBackClicked(): void {
		dispatch('back-clicked');
	}
</script>

<div class="flex items-center mb-6">
	{#if backButton}
		<Button on:click={onBackClicked} color="light" class="!p-1.5 !border-none mr-2">
			<ArrowLeft size="24" />
		</Button>
	{/if}
	<div class="flex-1">
		<Heading tag="h4">
			<slot />
		</Heading>
	</div>
</div>
