<script lang="ts">
	import { Select } from 'flowbite-svelte';
	import { locale, t } from '../utils/i18n.js';
	import { getState, setState } from '../utils/local-storage-state';
	import { AppReloader } from '../stores/app/app-reloader';
	import { appSettingsStore } from '../stores/app/app-settings';

	const localeOptions = [
		{
			value: 'en',
			name: 'English'
		},
		{
			value: 'ua',
			name: 'Українська'
		}
	];
	const appReloader = new AppReloader();

	function onLocaleChange(): void {
		const state = getState();
		setState({ ...state, appSettings: { ...state.appSettings, lang: $locale } });
		appSettingsStore.set({ ...state.appSettings, lang: $locale });
		appReloader.reload();
	}
</script>

<Select
	style="width: 117px;"
	placeholder={$t('app.lang-placeholder')}
	items={localeOptions}
	bind:value={$locale}
	on:change={onLocaleChange}
/>
