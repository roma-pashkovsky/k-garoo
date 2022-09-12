<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { getInitialState, getState, setState } from '../utils/local-storage-state';
	import { goto } from '$app/navigation';
	import { defaultLocale, locale } from '../utils/i18n';
	import translations from '../utils/i18n-translations';
	import { ToastService } from '../utils/toasts';
	import AppToast from '../lib/AppToast.svelte';
	import FullPageSpinner from '../lib/FullPageSpinner.svelte';

	const toastStore = ToastService.getInstance().toasts;
	let isInitialized = false;
	$: toasts = $toastStore.filter((t) => t.type === 'page-bottom');

	onMount(() => {
		const appVersion = 3;
		const state = getState();
		const l = state?.appSettings?.lang || getLocaleFromBrowser();
		locale.set(l);
		if (state.appVersion !== appVersion) {
			if (
				!Object.keys(state).length ||
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
		isInitialized = true;
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

{#if isInitialized}
	<div class="fixed top-0 bottom-0 left-0 right-0 flex flex-col">
		<div class="flex-1 relative">
			<slot />
		</div>
	</div>

	<div class="toast-wrapper">
		{#each toasts as toast}
			<div class="toast">
				<AppToast class="toast" {toast} />
			</div>
		{/each}
	</div>
{:else}
	<FullPageSpinner />
{/if}

<style>
	.toast-wrapper {
		position: fixed;
		bottom: 0.5rem;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.toast:not(:last-child) {
		margin-bottom: 0.5rem;
	}
</style>
