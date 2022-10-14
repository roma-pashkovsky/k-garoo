<script lang="ts">
	import { onMount } from 'svelte';

	export let value: string;
	export let selectOnInit = false;
	let input: HTMLInputElement;

	onMount(() => {
		if (selectOnInit && input) {
			input.select();
		}
	});
</script>

<input
	class="single-line !bg-transparent w-full form-input block !border-none disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 text-gray-900 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:border-gray-500 p-2 text-sm"
	id="form-input"
	autocomplete="off"
	autofocus
	inputmode="text"
	bind:value
	bind:this={input}
	on:submit
	on:input
	on:blur
	on:focus
/>
