<script lang="ts">
	import { AppSettingsStore, defaultLocale } from '../stores/app/app-settings.js';
	import { Select } from 'flowbite-svelte';
	import { derived, get } from 'svelte/store';
	import { t } from '../stores/app/translate';
	import type { Theme } from '../types';
	import { translate } from '../utils/i18n';

	let theme: Theme = get(AppSettingsStore.theme);
	const themeOptions = derived(AppSettingsStore.lang, () => {
		return [
			{
				name: translate(get(AppSettingsStore.lang) || defaultLocale, 'settings.header.theme-light'),
				value: 'light'
			},
			{
				name: translate(get(AppSettingsStore.lang) || defaultLocale, 'settings.header.theme-dark'),
				value: 'dark'
			}
		];
	});

	function onChange(): void {
		AppSettingsStore.setTheme(theme);
	}
</script>

<Select
	style="width: 117px;"
	placeholder={$t('settings.header.theme')}
	items={$themeOptions}
	bind:value={theme}
	on:change={onChange}
/>
