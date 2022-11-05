<script lang="ts">
	import { Dropdown, ToolbarButton } from 'flowbite-svelte';
	import { getRandomElementId } from '../utils/get-random-element-id';
	export let id = 'trigger-id' + getRandomElementId(6);
	export let open: boolean;
	export let widthClass = 'w-44';
</script>

<div {id}>
	<ToolbarButton
		class="w-9 h-9 dots-menu text-gray-900 dark:text-white inline-flex items-center justify-center"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-5 h-5"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
			/></svg
		>
	</ToolbarButton>
</div>

<Dropdown bind:open class={widthClass} triggeredBy="#{id}">
	<slot />
</Dropdown>
