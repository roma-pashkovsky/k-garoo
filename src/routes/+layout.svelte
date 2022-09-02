<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { getInitialState, getState, setState } from '../utils/local-storage-state';
	import { goto } from '$app/navigation';
	onMount(() => {
		const appVersion = 1;
		const state = getState();
		if (state && state.appVersion !== appVersion) {
			if (
				confirm(
					'K-garoo was updated. Your lists should be cleaned for the app to work correctly. Continue?'
				)
			) {
				setState({ ...getInitialState(), appVersion });
				goto('/home/lists');
				setTimeout(() => {
					window.location.reload();
				}, 200);
			}
		}
	});
</script>

<slot />
