<script lang="ts">
	import { Navbar, NavBrand, NavHamburger, NavLi, NavUl, Select } from 'flowbite-svelte';
	import { locale, t } from '../utils/i18n.js';
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';

	const dispatch = createEventDispatcher();
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

	function onLocaleChange(): void {
		dispatch('locale-change');
	}

	$: section = getSectionFromPath($page.url.pathname);

	function getSectionFromPath(path: string): string {
		const segments = path.split('/');
		if (segments[1] === 'home') {
			return segments[2];
		} else {
			return segments[1];
		}
	}
</script>

<Navbar
	navClass="bg-white px-2 sm:px-4 py-2.5 dark:bg-gray-800 w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600"
	navDivClass="!w-full flex flex-wrap justify-between !max-w-full container"
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
	<div class="md:order-2 flex items-center flex-wrap md:ml-6">
		<Select
			style="width: 117px;"
			placeholder={$t('app.lang-placeholder')}
			items={localeOptions}
			bind:value={$locale}
			on:change={onLocaleChange}
		/>
		<NavHamburger on:click={toggle} />
	</div>
	<NavUl {hidden} divClass="w-full md:flex md:flex-1 md:items-center md:justify-end">
		<NavLi href="/home/lists" active={section === 'lists'}>{$t('app.sections.lists')}</NavLi>
		<!--		<NavLi href="/login" active={section === 'login'}>{$t('app.sections.login')}</NavLi>-->
	</NavUl>
</Navbar>
