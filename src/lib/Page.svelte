<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div
	in:fade
	class="absolute top-0 bottom-0 left-0 right-0 pt-4 pl-4 pr-4 pb-6 h-full overflow-y-auto"
>
	<slot />
</div>
