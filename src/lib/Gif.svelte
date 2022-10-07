<script lang="ts">
	import { onMount } from 'svelte';

	export let width = 'auto';
	export let height = 'auto';
	export let src: string;
	export let alt = 'image';
	export let addClass = '';

	let imgSrc = '/';

	onMount(() => {
		setTimeout(() => (imgSrc = src));
	});
</script>

<img class={addClass} src={imgSrc} {width} {alt} style="height: {height}; width: {width}" />
