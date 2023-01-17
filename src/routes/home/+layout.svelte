<script lang="ts">
	import NavBar from '../../lib/NavBar.svelte';
	import { offline } from '../../stores/offline-mode/offline-mode.store.js';
	import OfflineBar from '../../lib/OfflineBar.svelte';
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import { isChecklistDetailsClientRoute } from '../../utils/client-routes';
	import InitConfigPopup from '../../lib/InitConfigPopup.svelte';
	import { AppSettingsStore } from '../../stores/app/app-settings';
	import { goto } from '$app/navigation';
	import type { Page } from '@sveltejs/kit';
	import { fade, slide } from 'svelte/transition';
	import TopStatusBar from '../../lib/TopStatusBar.svelte';
	import { syncTaskProcessing } from '../../utils/process-sync-tasks.js';

	const isSetLocalePopupOpen = derived(
		[AppSettingsStore.isLocaleSet, page],
		([isLocaleSet, pp]) => {
			return !isLocaleSet && canShowInitConfigPopup(pp);
		}
	);
	const isHideNavBar = derived(page, ($page) => {
		return isChecklistDetailsClientRoute($page.url.pathname);
	});

	function canShowInitConfigPopup(p: Page): boolean {
		return !isChecklistDetailsClientRoute(p.url.pathname);
	}

	function onCloseSettingsPopup(): void {
		AppSettingsStore.markIsLocaleSet();
	}

	function onShowHowAddToMain(): void {
		AppSettingsStore.markIsLocaleSet();
		goto('/home/add-app-to-main-screen');
	}
</script>

<svelte:head>
	<meta property="og:image" content="https://www.garoo.fun/img/thumb.jpg" />
	<meta property="og:image:secure_url" content="https://www.garoo.fun/img/thumb.jpg" />
	<meta property="og:image:width" content="100" />
	<meta property="og:image:height" content="100" />
	<meta name="twitter:image" content="https://www.garoo.fun/img/thumb.jpg" />
</svelte:head>

<div class="w-full h-full flex justify-center bg-gray-200 dark:bg-gray-800">
	<div class="flex flex-col max-w-screen-lg w-full shadow-md bg-white dark:bg-slate-900">
		{#if $offline}
			<TopStatusBar>No Internet connection</TopStatusBar>
		{/if}
		{#if $syncTaskProcessing}
			<TopStatusBar>Synchronizing data...</TopStatusBar>
		{/if}
		{#if !$isHideNavBar}
			<div
				in:slide|local={{ delay: 200, duration: 300 }}
				class="z-20 w-full"
				style="contain: layout style;"
			>
				<NavBar />
			</div>
		{/if}
		<div class="flex-1 relative">
			<slot />
		</div>
	</div>
</div>

<InitConfigPopup
	open={$isSetLocalePopupOpen}
	on:complete={onCloseSettingsPopup}
	on:show-how-add-to-main={onShowHowAddToMain}
/>
