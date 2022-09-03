<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { getInitialState, getState, setState } from '../utils/local-storage-state';
	import { goto } from '$app/navigation';
	import { defaultLocale, locale } from '../utils/i18n';
	import translations from '../utils/i18n-translations';
	onMount(() => {
		const appVersion = 2;
		const state = getState();
		const l = state?.checklistSettings?.lang || getLocaleFromBrowser();
		locale.set(l);
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
				return;
			}
		}
		setState({
			...state,
			checklistSettings: {
				...(state?.checklistSettings || ({} as any)),
				lang: l
			}
		});
	});
	function getLocaleFromBrowser(): string {
		const browserLanguages = navigator.languages;
		for (let i = 0; i < browserLanguages.length; i++) {
			const l = browserLanguages[i].split('-')[0];
			if (translations[l]) {
				return l;
			}
		}
		return defaultLocale;
	}
</script>

<slot />
