<script lang="ts">
	import { Select } from 'flowbite-svelte';
	import { AppReloader } from '../stores/app/app-reloader';
	import { AppSettingsStore } from '../stores/app/app-settings';
	import { get } from 'svelte/store';
	import { t } from '../stores/app/translate';
	import type { Language } from '../types';

	let lang: Language = get(AppSettingsStore.lang);

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
		AppSettingsStore.setLanguage(lang);
	}
</script>

<Select
	style="width: 117px;"
	placeholder={$t('app.lang-placeholder')}
	items={localeOptions}
	bind:value={lang}
	on:change={onLocaleChange}
/>
