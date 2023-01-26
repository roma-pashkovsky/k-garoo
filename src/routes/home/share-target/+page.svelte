<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let url: string;
	let title: string;
	let text: string;

	onMount(() => {
		url = $page.url.searchParams.get('url');
		title = $page.url.searchParams.get('title');
		text = $page.url.searchParams.get('text');
	});
</script>

<div>
	<div>
		<span>Url: </span> <span>{url}</span>
		<span>Title: </span> <span>{title}</span>
		<span>Text: </span> <span>{text}</span>
	</div>
</div>
