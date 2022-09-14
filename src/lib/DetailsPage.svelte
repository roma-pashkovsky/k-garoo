<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div in:fade class="fixed top-0 bottom-0 left-0 right-0 flex flex-col">
	<slot />
</div>
