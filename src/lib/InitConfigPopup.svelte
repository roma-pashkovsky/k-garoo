<script lang="ts">
	import { Button, Modal } from 'flowbite-svelte';
	import LocaleSelector from './LocaleSelector.svelte';
	import ThemeSelector from './ThemeSelector.svelte';
	import { t } from '../stores/app/translate';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { get } from 'svelte/store';
	import { AppSettingsStore } from '../stores/app/app-settings';

	export let open: boolean;

	let step = 1;
	const dispatch = createEventDispatcher();
	const lang = get(AppSettingsStore.lang);

	export const imagePaths = {
		'android-1': {
			ua: '/img/add-android-1-ua.png',
			en: '/img/add-android-1-en.png'
		},
		'android-2': '/img/add-android-2.png',
		'iphone-1': '/img/add-iphone-1.png',
		'iphone-2': {
			ua: '/img/add-iphone-2-ua.png',
			en: '/img/add-iphone-2-en.png'
		},
		'iphone-3': {
			ua: '/img/add-iphone-3-ua.png',
			en: '/img/add-iphone-3-en.png'
		},
		'iphone-4': '/img/add-iphone-4.png'
	};

	function onStep1Submit(): void {
		step = 2;
	}

	function onStep2Submit(): void {
		dispatch('complete');
	}

	function onShowHowAddToMain(): void {
		dispatch('show-how-add-to-main');
	}

	function onHidePopup(): void {
		dispatch('complete');
	}
</script>

<Modal bind:open size="xs" on:hide={onHidePopup}>
	{#if step === 1}
		<div in:fade>
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
			<div onclick="event.stopPropagation()" class="flex justify-end">
				<Button on:click={onStep1Submit} type="submit" class="w-50">{$t('app.ok.long')}</Button>
			</div>
		</div>
	{:else}
		<div class="max-w-md w-full py-2 px-4">
			<div>{$t('app.initial-popup.add-to-main-recommend')}</div>

			<div class="flex justify-center my-4">
				<img src="/img/add-to-main.png" class="rounded" width="120" />
			</div>

			<div class="flex justify-end space-x-2">
				<Button class="w-50" on:click={onStep2Submit} color="white">{$t('app.later')}</Button>
				<Button class="w-50" on:click={onShowHowAddToMain}>{$t('app.show-me-how')}</Button>
			</div>
		</div>
	{/if}
</Modal>
