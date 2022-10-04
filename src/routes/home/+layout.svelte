<script lang="ts">
	import NavBar from '../../lib/NavBar.svelte';
</script>

<div class="fixed top-0 bottom-0 left-0 right-0 flex justify-center bg-gray-800">
	<div class="flex flex-col max-w-screen-lg w-full shadow-md bg-white dark:bg-slate-900">
		<div class="z-20">
			<NavBar />
		</div>
		<div class="flex-1 relative">
			<slot />
		</div>
	</div>
</div>
