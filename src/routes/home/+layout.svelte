<script lang="ts">
	import { Navbar, NavBrand, NavHamburger, NavLi, NavUl, Select } from 'flowbite-svelte';
	import { locale } from '../../utils/i18n';
	import { getState, setState } from '../../utils/local-storage-state';

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

	function onLocaleChange() {
		const state = getState();
		setState({ ...state, checklistSettings: { ...state.checklistSettings, lang: $locale } });
	}
</script>

<div class="fixed top-0 bottom-0 left-0 right-0 flex flex-col">
	<Navbar
		navClass="bg-white px-2 sm:px-4 py-2.5 dark:bg-gray-800 w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600"
		let:hidden
		let:toggle
		rounded={true}
	>
		<NavBrand href="/">
			<img src="/logo-blue.svg" class="mr-3 h-6 sm:h-9" alt="K-garoo logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
				K-garoo
			</span>
		</NavBrand>
		<div class="flex md:order-2">
			<Select items={localeOptions} bind:value={$locale} on:change={onLocaleChange} />
		</div>
	</Navbar>
	<div class="flex-1 overflow-y-auto relative">
		<slot />
	</div>
</div>
