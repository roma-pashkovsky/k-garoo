<script lang="ts">
	import NavBar from '../../lib/NavBar.svelte';
	import { offline } from '../../stores/offline-mode/offline-mode.store.js';
	import OfflineBar from '../../lib/OfflineBar.svelte';
	import { page } from '$app/stores';
	import { derived, get } from 'svelte/store';
	import { isChecklistDetailsClientRoute } from '../../utils/client-routes';
	import InitConfigPopup from '../../lib/InitConfigPopup.svelte';
	import { AppSettingsStore } from '../../stores/app/app-settings';
	import { goto } from '$app/navigation';

	let isSetLocalePopupOpen = !get(AppSettingsStore.isLocaleSet);
	const isHideNavBar = derived(page, ($page) => {
		return isChecklistDetailsClientRoute($page.url.pathname);
	});

	function onCloseSettingsPopup(): void {
		AppSettingsStore.markIsLocaleSet();
	}

	function onShowHowAddToMain(): void {
		AppSettingsStore.markIsLocaleSet();
		goto('/home/add-app-to-main-screen');
	}
</script>

<div class="w-full h-full flex justify-center bg-gray-800">
	<div class="flex flex-col max-w-screen-lg w-full shadow-md bg-white dark:bg-slate-900">
		{#if $offline}
			<OfflineBar />
		{/if}
		{#if !$isHideNavBar}
			<div class="z-20 w-full" style="min-height: 58px; contain: layout style;">
				<NavBar />
			</div>
		{/if}
		<div class="flex-1 relative">
			<slot />
		</div>
	</div>
</div>

<InitConfigPopup
	open={isSetLocalePopupOpen}
	on:complete={onCloseSettingsPopup}
	on:show-how-add-to-main={onShowHowAddToMain}
/>
