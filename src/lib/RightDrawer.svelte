<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Drawer } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';

	export let hidden: boolean;
	let transitionParams = {
		x: 300,
		duration: 200,
		easing: sineIn
	};

	const dispatch = createEventDispatcher();
</script>

<Drawer
	placement="right"
	transitionType="fly"
	position="fixed"
	rightOffset="inset-y-0 right-0"
	topOffset="top-0"
	bottomOffset="bottom-0"
	width="w-80"
	bind:hidden
	{transitionParams}
>
	<slot />
</Drawer>
