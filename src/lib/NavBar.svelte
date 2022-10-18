<script lang="ts">
	import { Navbar, NavBrand, NavHamburger, NavLi, NavUl } from 'flowbite-svelte';
	import UserMenu from './UserMenu.svelte';
	import { page } from '$app/stores';
	import { AuthStore } from '../stores/login/auth.store';
	import { t } from '../stores/app/translate';
	import { click_outside } from '../utils/click-outside';

	let hidden = true;
	const user = AuthStore.user;

	$: section = getSectionFromPath($page.url.pathname);

	function getSectionFromPath(path: string): string {
		const segments = path.split('/');
		if (segments[1] === 'home') {
			return segments[2];
		} else {
			return segments[1];
		}
	}

	function onLoginClick(): void {
		AuthStore.isLoginModalOpen.set(true);
	}

	function onToggle(): void {
		hidden = !hidden;
	}

	function onWrapperClickOutside(): void {
		hidden = true;
	}
</script>

<div use:click_outside on:click_outside={onWrapperClickOutside}>
	<Navbar
		navClass="bg-white px-2 sm:px-4 py-2.5 dark:bg-gray-800 w-full z-20 top-0 left-0 border-b !border-gray-200 dark:!border-gray-600 shadow-sm"
		navDivClass="!w-full flex flex-wrap justify-between !max-w-full"
		rounded={false}
		fluid={false}
	>
		<NavBrand href="/home/lists">
			<img
				src="/logo-blue.png"
				width="30"
				height="24"
				class="mr-3 block sm:hidden"
				alt="K-garoo logo"
			/>
			<img
				src="/logo-blue.png"
				width="45"
				height="36"
				class="mr-3 hidden sm:block"
				alt="K-garoo logo"
			/>
			<span
				class="self-center whitespace-nowrap text-xl font-semibold dark:text-white inline-block w-32"
			>
				Garoo
				<a href="/home/support-ukraine"
					><img
						src="/flag-Ukraine.png"
						height="15"
						alt="support Ukraine"
						class="h-6 inline-block"
					/></a
				>
			</span>
		</NavBrand>
		<div class="flex items-center flex-wrap md:order-2">
			<UserMenu />
			<NavHamburger class="md:hidden" on:click={onToggle} />
		</div>
		<NavUl
			{hidden}
			divClass="w-full md:block md:w-auto md:flex-1"
			ulClass="flex flex-col py-2 px-4 mt-4 md:flex-row md:flex-1 md:justify-end md:space-x-8 md:mt-0 md:text-sm md:font-medium"
		>
			<NavLi href="/home/lists" active={section === 'lists'}>{$t('app.sections.lists')}</NavLi>
			<NavLi href="/home/settings" active={section === 'settings'}
				>{$t('app.sections.settings')}</NavLi
			>
			<NavLi href="/home/about" active={section === 'about'}>{$t('app.sections.about')}</NavLi>
			{#if !$user}
				<div on:click={onLoginClick}>
					<NavLi class="cursor-pointer">{$t('app.sections.login')}</NavLi>
				</div>
			{/if}
		</NavUl>
	</Navbar>
</div>
