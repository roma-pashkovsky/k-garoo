<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { getInitialState, getState, setState } from '../utils/local-storage-state';
	import { goto } from '$app/navigation';
	import { defaultLocale, locale } from '../utils/i18n';
	import translations from '../utils/i18n-translations';
	import { ToastService } from '../utils/toasts';
	import NavBar from '../lib/NavBar.svelte';
	import { Spinner } from 'flowbite-svelte';
	import AppToast from '../lib/AppToast.svelte';

	const toastStore = ToastService.getInstance().toasts;
	$: toasts = $toastStore.filter((t) => t.type === 'page-bottom');

	onMount(() => {
		const appVersion = 2;
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

	let isReloading = false;

	function onLocaleChange() {
		const state = getState();
		setState({ ...state, appSettings: { ...state.appSettings, lang: $locale } });
		isReloading = true;
		setTimeout(() => {
			isReloading = false;
		}, 300);
	}
</script>

<div class="fixed top-0 bottom-0 left-0 right-0 flex flex-col">
	<NavBar on:locale-change={onLocaleChange} />
	<div class="flex-1 relative">
		{#if isReloading}
			<div class="flex h-full w-full justify-center items-center">
				<Spinner />
			</div>
		{:else}
			<slot />
		{/if}
	</div>
</div>

<div class="toast-wrapper">
	{#each toasts as toast}
		<div class="toast">
			<AppToast class="toast" {toast} />
		</div>
	{/each}
</div>

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
