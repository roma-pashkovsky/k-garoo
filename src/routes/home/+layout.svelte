<script lang="ts">
	import NavBar from '../../lib/NavBar.svelte';
	import { offline } from '../../stores/offline-mode/offline-mode.store.js';
	import OfflineBar from '../../lib/OfflineBar.svelte';
</script>

<div class="w-full h-full flex justify-center bg-gray-800">
	<div class="flex flex-col max-w-screen-lg w-full shadow-md bg-white dark:bg-slate-900">
		{#if $offline}
			<OfflineBar />
		{/if}
		<div class="z-20 w-full" style="min-height: 58px; contain: layout style;">
			<NavBar />
		</div>
		<div class="flex-1 relative">
			<slot />
		</div>
	</div>
</div>
