<script lang="ts">
	import { offline } from '../stores/offline-mode/offline-mode.store';
	import OfflineBar from './OfflineBar.svelte';
</script>

<div
	class="select-none fixed top-0 bottom-0 left-0 right-0 flex justify-center bg-gray-800 dark:bg-gray-800"
>
	<div class="flex flex-col relative w-full max-w-screen-lg bg-white dark:bg-slate-900 -z-10">
		{#if $offline}
			<OfflineBar />
		{/if}
		<slot />
	</div>
</div>
