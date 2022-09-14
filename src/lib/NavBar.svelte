<script lang="ts">
	import { Navbar, NavBrand, NavHamburger, NavLi, NavUl } from 'flowbite-svelte';
	import { t } from '../utils/i18n.js';
	import { page } from '$app/stores';

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
	fluid={false}
>
	<NavBrand href="/">
		<img src="/logo-blue.svg" class="mr-3 h-6 sm:h-9" alt="K-garoo logo" />
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
			K-garoo
		</span>
	</NavBrand>
	<div class="md:hidden flex items-center flex-wrap">
		<NavHamburger on:click={toggle} />
	</div>
	<NavUl
		{hidden}
		divClass="w-full md:flex md:flex-1 md:items-center md:justify-end"
		ulClass="flex flex-col p-4 sm:p-0 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium"
	>
		<NavLi href="/home/lists" active={section === 'lists'}>{$t('app.sections.lists')}</NavLi>
		<NavLi href="/home/settings" active={section === 'settings'}
			>{$t('app.sections.settings')}</NavLi
		>
	</NavUl>
</Navbar>
