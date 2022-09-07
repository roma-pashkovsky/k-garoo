<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Drawer } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	export let hidden;
	let initialized = false;
	let transitionParams = {
		x: 300,
		duration: 200,
		easing: sineIn
	};

	onMount(() => {
		setTimeout(() => {
			initialized = true;
		}, 200);
	});

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
