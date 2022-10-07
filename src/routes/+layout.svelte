<script lang="ts">
	import '../app.css';
	import { navigating } from '$app/stores';
	import { ToastService } from '../utils/toasts';
	import AppToast from '../lib/AppToast.svelte';
	import FullPageSpinner from '../lib/FullPageSpinner.svelte';
	import { AppReloader } from '../stores/app/app-reloader';
	import { Button, Modal } from 'flowbite-svelte';
	import LocaleSelector from '../lib/LocaleSelector.svelte';
	import ThemeSelector from '../lib/ThemeSelector.svelte';
	import { fade } from 'svelte/transition';
	import { AuthStore } from '../stores/login/auth.store';
	import Login from '../lib/Login.svelte';
	import { AppSettingsStore } from '../stores/app/app-settings';
	import { get } from 'svelte/store';
	import { t } from '../stores/app/translate';

	const toastStore = ToastService.getInstance().toasts;
	const isAppReloading = AppReloader.isReloading;
	let isSetLocalePopupOpen = !get(AppSettingsStore.isLocaleSet);
	const isLoginModalOpen = AuthStore.isLoginModalOpen;
	const isSyncingData = AuthStore.isSyncingData;
	const theme = AppSettingsStore.theme;
	$: toasts = $toastStore.filter((t) => t.type === 'page-bottom');
	$: topToasts = $toastStore.filter((t) => t.type === 'details-top');
	$: isNavigating = !!$navigating;

	function onSuccessfulLogin() {
		AuthStore.isLoginModalOpen.set(false);
	}

	function onCloseSettingsPopup(): void {
		AppSettingsStore.markIsLocaleSet();
	}
</script>

<svelte:head>
	<title>K-garoo - {$t('app.logo')}</title>
</svelte:head>

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

<div class="fixed top-0 bottom-0 left-0 right-0 root {$theme}">
	<div class="fixed top-0 bottom-0 left-0 right-0 dark:bg-black dark:text-white">
		{#if $isAppReloading || $isSyncingData || $navigating}
			<FullPageSpinner />
		{/if}
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
	</div>
</div>

<Modal bind:open={isSetLocalePopupOpen} size="xs" on:hide={onCloseSettingsPopup}>
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

<Modal
	class="z-50"
	title={$t('app.login-popup.title')}
	placement="center"
	bind:open={$isLoginModalOpen}
>
	<Login on:success={onSuccessfulLogin} />
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
