<script lang="ts">
	import { fade } from 'svelte/transition';
	export let paddingClass = 'p-4';
</script>

<div
	role="alert"
	in:fade
	class="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg  border border-gray-200 dark:border-gray-700 w-full {paddingClass}"
>
	<slot />
</div>
