<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	export let focused = false;
	export let pasteDiv: HTMLDivElement;

	const dispatch = createEventDispatcher();
	const listener = (event) => dispatch('paste', event);

	$: {
		if (focused && pasteDiv) {
			pasteDiv.focus();
		}
	}

	onMount(() => {
		if (focused) {
			pasteDiv.focus();
		}
		pasteDiv.addEventListener('paste', listener);
	});

	onDestroy(() => {
		if (pasteDiv) {
			pasteDiv.removeEventListener('paste', listener);
		}
	});
</script>

<div id="paste-capture-parent">
	<div bind:this={pasteDiv} id="paste-capture-area" contenteditable="true" />
</div>
