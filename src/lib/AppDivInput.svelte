<script lang="ts">
	import { onMount } from 'svelte';
	import { Keycodes } from '../utils/keycodes';
	import { createEventDispatcher } from 'svelte';

	export let id: string;
	export let value = '';
	export let div: HTMLDivElement;
	const dispatch = createEventDispatcher();

	let prevId: string;

	$: {
		if (id !== prevId) {
			setTimeout(() => {
				setCaretToEnd(div);
			});
		}
		prevId = id;
	}

	onMount(() => {
		setCaretToEnd(div);
	});

	function onKeyDown({ keyCode }: KeyboardEvent): void {
		if (keyCode === Keycodes.ENTER) {
			dispatch('submit');
		}
	}

	function setCaretToEnd(target: HTMLDivElement) {
		if (!target) {
			return;
		}
		const range = document.createRange();
		const sel = window.getSelection();
		range.selectNodeContents(target);
		range.collapse(false);
		sel.removeAllRanges();
		sel.addRange(range);
		target.focus();
		range.detach(); // optimization
	}
</script>

<div
	bind:textContent={value}
	bind:this={div}
	on:input
	on:keydown
	on:keyup
	on:paste={() => setCaretToEnd(div)}
	contenteditable="true"
	class="single-line [&_*]:inline [&_*]:whitespace-nowrap [&_br]:hidden focus:outline-none focus:bg-blue-100"
/>

<style>
	.single-line {
		white-space: nowrap;
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
		align-items: center;
		padding: 0.625rem;
		text-align: left;
	}
</style>
