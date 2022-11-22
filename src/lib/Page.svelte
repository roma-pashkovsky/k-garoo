<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div
	in:fade={{ delay: 300, duration: 250 }}
	out:fade={{ duration: 250 }}
	class="absolute top-0 left-0 right-0 pt-8 pl-4 pr-4 md:pl-8 md:pr-8 pb-6 h-full overflow-y-auto"
	style="bottom: env(safe-area-inset-bottom)"
>
	<slot />
</div>
