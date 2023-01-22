<script lang="ts">
	import '../app.css';
	import { navigating } from '$app/stores';
	import { ToastService } from '../utils/toasts';
	import AppToast from '../lib/AppToast.svelte';
	import FullPageSpinner from '../lib/FullPageSpinner.svelte';
	import { AppReloader } from '../stores/app/app-reloader';
	import { AppSettingsStore } from '../stores/app/app-settings';
	import { onMount } from 'svelte';
	import { t } from '../stores/app/translate';

	const toastStore = ToastService.getInstance().toasts;
	const isAppReloading = AppReloader.isReloading;
	const theme = AppSettingsStore.theme;
	let viewPort: VisualViewport;
	$: toasts = $toastStore.filter((t) => t.type === 'page-bottom');
	$: topToasts = $toastStore.filter((t) => t.type === 'details-top');

	onMount(() => {
		viewPort = window.visualViewport;
		setViewportHeightProperty();
		let prevTheme: string | null = null;
		theme.subscribe((themeVal) => {
			if (prevTheme) {
				document.body.classList.remove(prevTheme);
			}
			document.body.classList.add(themeVal);
			document
				.querySelector('meta[name="theme-color"]')
				.setAttribute('content', themeVal === 'dark' ? '#111827' : '#FFFFFF');
			prevTheme = themeVal;
		});
		viewPort.addEventListener('resize', () => {
			setViewportHeightProperty();
		});
	});

	function setViewportHeightProperty(): void {
		let vh = viewPort.height * 0.01;
		// Then we set the value in the --vh custom property to the root of the document
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	}
</script>

<svelte:head>
	<title>Garoo - {$t('app.logo')}</title>
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

<div class="w-full h-full relative {$theme}">
	<div class="w-full h-full relative dark:text-white">
		{#if $isAppReloading || $navigating}
			<FullPageSpinner />
		{/if}
		<div class="top-toast-wrapper right-4 sm:right-6">
			{#each topToasts as toast}
				<div class="toast">
					<AppToast class="toast" {toast} />
				</div>
			{/each}
		</div>

		<div class="toast-wrapper">
			{#each toasts as toast}
				<div class="toast">
					<AppToast class="toast" {toast} />
				</div>
			{/each}
		</div>

		<slot />
	</div>
</div>

<style>
	.top-toast-wrapper {
		position: fixed;
		top: calc(env(safe-area-inset-top) + 5rem);
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
