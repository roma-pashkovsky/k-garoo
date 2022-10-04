<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div
	class="select-none fixed top-0 bottom-0 left-0 right-0 flex justify-center bg-gray-800 dark:bg-gray-800"
>
	<div class="flex flex-col h-screen w-full max-w-screen-lg bg-white dark:bg-slate-900 -z-10">
		<slot />
	</div>
</div>
