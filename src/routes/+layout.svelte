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
	import { AppReloader } from '../stores/app/app-reloader';
	import { Button, Modal } from 'flowbite-svelte';
	import LocaleSelector from '../lib/LocaleSelector.svelte';
	import { t } from '../utils/i18n.js';
	import { appSettingsStore } from '../stores/app/app-settings';
	import type { Writable } from 'svelte/store';
	import type { AppSettings } from '../types';
	import ThemeSelector from '../lib/ThemeSelector.svelte';
	import { fade } from 'svelte/transition';

	const toastStore = ToastService.getInstance().toasts;
	let isInitialized = false;
	const appVersion = 4;
	const isAppReloading = AppReloader.isReloading;
	let isSetLocalePopupOpen = false;
	const appSettings: Writable<AppSettings> = appSettingsStore;
	$: toasts = $toastStore.filter((t) => t.type === 'page-bottom');
	$: topToasts = $toastStore.filter((t) => t.type === 'details-top');

	onMount(async () => {
		await checkForUpdatedApp();
		await setAppSettings();
		await checkForLocale();
		isInitialized = true;
	});

	async function setAppSettings(): Promise<void> {
		const store = getState();
		appSettings.set(store.appSettings);
	}

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

	async function checkForLocale(): Promise<void> {
		const state = getState();
		const isLocaleSet = !!state.appSettings.isLocaleSet;
		if (isLocaleSet) {
			const l = $appSettings?.lang || getLocaleFromBrowser();
			locale.set(l);
			setState({
				...state,
				appSettings: {
					...(state?.appSettings || ({} as any)),
					lang: l
				}
			});
			appSettingsStore.set({ ...(state?.appSettings || ({} as any)), lang: l });
		} else {
			isSetLocalePopupOpen = true;
		}
	}

	async function onSelectLocaleFromPopup(): Promise<void> {
		const state = getState();
		isSetLocalePopupOpen = false;
		setState({
			...state,
			appSettings: {
				...(state?.appSettings || ({} as any)),
				isLocaleSet: true
			}
		});
	}

	async function checkForUpdatedApp(): Promise<void> {
		const state = getState();
		if (state?.appVersion !== appVersion) {
			if (
				!Object.keys(state).length ||
				confirm(
					'K-garoo was updated. Your lists should be cleaned for the app to work correctly. Continue?'
				)
			) {
				setState({ ...getInitialState(), appVersion });
				goto('/home/lists');
				await new AppReloader().reload();
			}
		}
	}
</script>

<!--Load tailwind colors-->
<div
	class="bg-slate-100 bg-zinc-100 bg-red-100 bg-lime-100 bg-orange-100 bg-emerald-100 bg-teal-100 bg-cyan-100 bg-indigo-100 bg-rose-100 bg-fuchsia-100 bg-gray-100 bg-green-100 bg-yellow-100 bg-purple-100 bg-blue-100 bg-amber-100  fill-black fill-gray-400"
/>

<div
	class="bg-slate-900 bg-zinc-900 bg-red-900 bg-lime-900 bg-orange-900 bg-emerald-900 bg-teal-900 bg-cyan-900 bg-indigo-900 bg-rose-900 bg-fuchsia-900 bg-gray-900
	bg-green-900
	bg-yellow-900
	bg-purple-900
	bg-blue-900
	bg-amber-900"
/>

<div class="fixed top-0 bottom-0 left-0 right-0 root {$appSettings?.theme}">
	<div class=" fixed top-0 bottom-0 left-0 right-0 dark:bg-black dark:text-white">
		{#if !isInitialized || $isAppReloading}
			<FullPageSpinner />
		{:else}
			<div class="top-toast-wrapper right-4 sm:right-6">
				{#each topToasts as toast}
					<div class="toast">
						<AppToast class="toast" {toast} />
					</div>
				{/each}
			</div>

			<slot />

			<div class="toast-wrapper">
				{#each toasts as toast}
					<div class="toast">
						<AppToast class="toast" {toast} />
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<Modal bind:open={isSetLocalePopupOpen} size="xs" on:hide={onSelectLocaleFromPopup}>
	<form on:submit|preventDefault={() => (isSetLocalePopupOpen = false)} in:fade>
		<h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 mb-4">
			{$t('app.initial-popup.title')}
		</h3>
		<p class="mb-3">{$t('app.initial-popup.personalize')}</p>
		<div class="flex space-x-2">
			<LocaleSelector />
			<ThemeSelector />
		</div>

		<p class="text-sm text-gray-600 py-3">
			{$t('app.initial-popup.settings-disclaimer')}
		</p>
		<div class="flex justify-end">
			<Button type="submit" class="w-50">{$t('app.ok.long')}</Button>
		</div>
	</form>
</Modal>

<style>
	.top-toast-wrapper {
		position: fixed;
		top: 5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		z-index: 30;
	}
	.toast-wrapper {
		position: fixed;
		bottom: 0.5rem;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		z-index: 30;
	}

	.toast:not(:last-child) {
		margin-bottom: 0.5rem;
	}
</style>
