<script lang="ts">
	import NavBar from '../../lib/NavBar.svelte';
	import { offline, startOfflineListener } from '../../stores/offline-mode/offline-mode.store.js';
	import { page } from '$app/stores';
	import { derived, get } from 'svelte/store';
	import { isChecklistDetailsClientRoute } from '../../utils/client-routes';
	import InitConfigPopup from '../../lib/InitConfigPopup.svelte';
	import { AppSettingsStore } from '../../stores/app/app-settings';
	import { goto } from '$app/navigation';
	import type { Page } from '@sveltejs/kit';
	import { slide } from 'svelte/transition';
	import TopStatusBar from '../../lib/TopStatusBar.svelte';
	import {
		processedSyncTasks,
		processSyncTasks,
		syncTaskProcessing
	} from '../../utils/process-sync-tasks.js';
	import { onMount } from 'svelte';
	import { initPropositions } from '../../stores/checklist-details/propositions';
	import { invalidAuthEventStore } from '../../utils/app-fetch';
	import { auth, loginClickEvents } from '../../stores/login/auth';
	import { loadListItems } from '../../stores/checklist-main-list/checklist-main-list-store';
	import { loadCategoryOptions } from '../../stores/checklist-details/category-options';
	import { loadSharedListIds } from '../../stores/my-shared-lists/my-shared-list.store';
	import { syncLocalDataEvent } from '../../stores/login/sync.store';
	import { cleanLocalDataOnLogout } from '../../utils/local-storage-state';
	import LoginModal from '../../lib/LoginModal.svelte';
	import UsersByListDrawer from '../../lib/UsersByListDrawer.svelte';
	import ShareList from '../../lib/checklist-details/ShareList.svelte';

	const isSetLocalePopupOpen = derived(
		[AppSettingsStore.isLocaleSet, page],
		([isLocaleSet, pp]) => {
			return !isLocaleSet && canShowInitConfigPopup(pp);
		}
	);
	const isHideNavBar = derived(page, ($page) => {
		return isChecklistDetailsClientRoute($page.url.pathname);
	});

	onMount(() => {
		initPropositions();
		startOfflineListener();
		invalidAuthEventStore.subscribe((ev) => {
			if (ev) {
				console.log('invalid auth event');
				auth.set({ user: null, isResolved: true, isSessionExpired: true });
				loginClickEvents.set(new Date().getTime());
			}
		});
		let prevUserId = get(auth)?.user?.id;
		auth.subscribe((a) => {
			const newUserId = a?.user?.id;
			if (newUserId !== prevUserId) {
				loadListItems(true);
				loadCategoryOptions(true);
				if (a.user) {
					loadSharedListIds();
					processSyncTasks();
				}
			}
			prevUserId = newUserId;
		});
		let prevOffline;
		offline.subscribe((offline) => {
			if (offline !== prevOffline) {
				prevOffline = offline;
				if (!offline) {
					processSyncTasks();
				}
			}
		});
		processedSyncTasks.subscribe((event) => {
			if (event) {
				loadListItems(true);
			}
		});
		syncLocalDataEvent.subscribe((event) => {
			if (event) {
				loadListItems(true);
			}
		});
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

	async function onCloseLoginModal() {
		if (get(auth).isSessionExpired) {
			await cleanLocalDataOnLogout();
			await goto('/home/lists');
			location.reload();
		}
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

<LoginModal on:dismiss={onCloseLoginModal} />

<UsersByListDrawer />

<ShareList />
