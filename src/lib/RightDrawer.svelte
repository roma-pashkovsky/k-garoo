<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	export let isOpen;
	let initialized = false;

	onMount(() => {
		setTimeout(() => {
			initialized = true;
		}, 200);
	});

	const dispatch = createEventDispatcher();

	export function onBackDropClicked(): void {
		dispatch('backdrop-click');
	}
</script>

{#if isOpen}
	<div class="fixed left-0 top-0 bottom-0 right-0 z-50 text-base">
		<div
			on:click|stopPropagation={onBackDropClicked}
			class="absolute left-0 top-0 bottom-0 right-0 z-40 bg-black opacity-50"
			style="background-color: black"
		/>
		<div
			class="pane absolute top-0 bottom-0 right-0 bg-white z-50 px-0.5 py-2 overflow-y-auto {initialized
				? '!w-80'
				: 'w-0'}"
		>
			<slot />
		</div>
	</div>
{/if}

<style>
	.pane {
		transition: width 0.4s ease-in;
	}
</style>
