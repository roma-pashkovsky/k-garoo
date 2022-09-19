<script lang="ts">
	import { appSettingsStore } from '../stores/app/app-settings.js';
	import { Select } from 'flowbite-svelte';
	import { t } from '../utils/i18n';
	import { getState, setState } from '../utils/local-storage-state';
	import { derived } from 'svelte/store';

	let theme = $appSettingsStore?.theme;
	const themeOptions = derived(appSettingsStore, () => [
		{
			name: ($t as any)('settings.header.theme-light'),
			value: 'light'
		},
		{
			name: ($t as any)('settings.header.theme-dark'),
			value: 'dark'
		}
	]);

	function onChange(): void {
		const state = getState();
		setState({
			...state,
			appSettings: {
				...state.appSettings,
				theme
			}
		});
		appSettingsStore.update((settings) => {
			return {
				...settings,
				theme
			};
		});
	}
</script>

<Select
	style="width: 117px;"
	placeholder={$t('settings.header.theme')}
	items={$themeOptions}
	bind:value={theme}
	on:change={onChange}
/>
