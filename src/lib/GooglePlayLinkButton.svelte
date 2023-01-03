<script lang="ts">
	import type { Language } from '../types';
	import { onMount } from 'svelte';

	export let lang: Language;
	export let height = 50;

	let wrapAnchor: HTMLAnchorElement;
	let imgEl: HTMLImageElement;
	let imageLink;
	onMount(() => {
		wrapAnchor.style.height = `${height}px`;
		if (lang === 'ua') {
			imageLink = '/google-play-badge_ua-cropped.png';
			imgEl.style.height = `${height}px`;
		} else {
			imageLink = '/google-play-badge_en-cropped.png';
			imgEl.style.height = `${height}px`;
		}
	});
</script>

<a
	bind:this={wrapAnchor}
	class="relative cursor-pointer block"
	href="https://play.google.com/store/apps/details?id=garoo.www.twa"
>
	<img bind:this={imgEl} src={imageLink} alt="google play store button" />
</a>
