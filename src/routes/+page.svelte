<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { t } from '../utils/i18n';

	export let data;

	onMount(() => {
		if (data.isAuthed) {
			goto('/home/lists');
		} else {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>K-garoo - {$t('app.logo')}</title>
</svelte:head>
