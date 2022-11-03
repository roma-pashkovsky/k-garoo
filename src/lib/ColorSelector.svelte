<script lang="ts">
	import { Button, Dropdown } from 'flowbite-svelte';
	import { categoryColors, darkEquivalents } from '../utils/category-colors';
	import { createEventDispatcher } from 'svelte';
	import { getRandomElementId } from '../utils/get-random-element-id';
	import Palette from './Palette.svelte';
	import { stopMouseEvent } from '../utils/stop-mouse-event';

	export let selected: string;
	export let classPrefix: string;
	export let placement = 'top';
	const darkBG = darkEquivalents;

	let id = getRandomElementId(6);
	let colors = categoryColors;
	const dispatch = createEventDispatcher();

	function onColorClick(color: string): void {
		dispatch('select', { color });
	}

	function getDarkVar(s: string): string {
		return (darkBG as any)[s];
	}
</script>

<div
	{id}
	tabindex="0"
	class="relative w-7 h-7 cursor-pointer flex focus:ring-1 items-center justify-center rounded {selected
		? classPrefix + selected
		: ''} dark:!bg-transparent"
>
	<div
		class="block top-0 bottom-0 left-0 right-0 hidden dark:block {selected
			? classPrefix + getDarkVar(selected)
			: ''}"
	/>
	<div class="hidden dark:block">
		<Palette color="gray-400" />
	</div>
	<div class="block dark:hidden">
		<Palette color="gray-600" />
	</div>
</div>

<Dropdown {placement} arrow={false} triggeredBy="#{id}" trigger="click">
	<div onmousedown={stopMouseEvent} class="p-2 grid grid-cols-6 gap-1 grid-rows-3">
		<Button class="!p-0.5 !rounded" color="light" on:click={() => onColorClick('transparent')}>
			<div class="w-6 h-6 rounded" />
		</Button>

		{#each colors as color}
			<Button class="!p-0.5 !rounded" color="light" on:click={() => onColorClick(color)}>
				<div class="relative w-6 h-6 rounded {classPrefix + color} dark:!bg-transparent">
					<div class="absolute inset-0 hidden dark:block {classPrefix + getDarkVar(color)}" />
				</div>
			</Button>
		{/each}
	</div>
</Dropdown>
