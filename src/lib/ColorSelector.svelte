<script lang="ts">
	import { Button, Dropdown, Tooltip } from 'flowbite-svelte';
	import { categoryColors, darkEquivalents } from '../utils/category-colors';
	import { createEventDispatcher } from 'svelte';
	import { getRandomElementId } from '../utils/get-random-element-id';
	import Palette from './Palette.svelte';

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
</script>

<div
	{id}
	tabindex="1"
	class="relative w-7 h-7 cursor-pointer flex focus:ring-1 items-center justify-center rounded {selected
		? classPrefix + selected
		: ''} dark:!bg-transparent"
>
	<div
		class="block top-0 bottom-0 left-0 right-0 hidden dark:block {selected
			? classPrefix + darkBG[selected]
			: ''}"
	/>
	<div class="hidden dark:block">
		<Palette size="20" color="gray-400" />
	</div>
	<div class="block dark:hidden">
		<Palette size="20" color="gray-600" />
	</div>
</div>

<Dropdown {placement} arrow={false} triggeredBy="#{id}" trigger="click">
	<div
		onmousedown="event.stopPropagation(); event.preventDefault()"
		class="p-2 grid grid-cols-6 gap-1 grid-rows-3"
	>
		<Button class="!p-0.5 !rounded" color="light" on:click={() => onColorClick('transparent')}>
			<div class="w-6 h-6 rounded" />
		</Button>

		{#each colors as color}
			<Button class="!p-0.5 !rounded" color="light" on:click={() => onColorClick(color)}>
				<div class="relative w-6 h-6 rounded {classPrefix + color} dark:!bg-transparent">
					<div class="absolute inset-0 hidden dark:block {classPrefix + darkBG[color]}" />
				</div>
			</Button>
		{/each}
	</div>
</Dropdown>
