<script lang="ts">
	import { Dropdown, ToolbarButton } from 'flowbite-svelte';
	export let widthClass = 'w-44';
</script>

<ToolbarButton
	class="dots-menu text-gray-900 bg-white dark:text-white dark:bg-gray-800 inline-flex items-center justify-center"
	style="height: 42px; width: 30px"
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
<Dropdown class={widthClass} triggeredBy=".dots-menu">
	<slot />
</Dropdown>
