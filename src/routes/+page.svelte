<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { standalone } from '../stores/app/app-settings';

	onMount(() => {
		const search = get(page).url.search;
		const isStandalone = search && search.indexOf('standalone') >= 0;
		standalone.set(isStandalone);
		goto('/home/lists');
	});
</script>
