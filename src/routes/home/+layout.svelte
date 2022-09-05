<script lang="ts">
	import { Navbar, NavBrand, Select, Spinner } from 'flowbite-svelte';
	import { locale, t } from '../../utils/i18n';
	import { getState, setState } from '../../utils/local-storage-state';
	import { ToastService } from '../../utils/toasts';
	import AppToast from '../../lib/AppToast.svelte';

	const toastStore = ToastService.getInstance().toasts;
	$: toasts = $toastStore.filter((t) => t.type === 'page-bottom');

	let isReloading = false;

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
		isReloading = true;
		setTimeout(() => {
			isReloading = false;
		}, 300);
	}
</script>

<div class="fixed top-0 bottom-0 left-0 right-0 flex flex-col">
	<Navbar
		navClass="bg-white px-2 sm:px-4 py-2.5 dark:bg-gray-800 w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600"
		navDivClass="!w-full flex justify-between !max-w-full"
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
		<div class="md:order-2">
			<Select
				style="width: 117px;"
				placeholder={$t('app.lang-placeholder')}
				items={localeOptions}
				bind:value={$locale}
				on:change={onLocaleChange}
			/>
		</div>
	</Navbar>
	<div class="flex-1 relative">
		{#if isReloading}
			<div class="flex h-full w-full justify-center items-center">
				<Spinner />
			</div>
		{:else}
			<slot />
		{/if}
	</div>
</div>

<div class="toast-wrapper">
	{#each toasts as toast}
		<div class="toast">
			<AppToast class="toast" {toast} />
		</div>
	{/each}
</div>

<style>
	.toast-wrapper {
		position: fixed;
		bottom: 0.5rem;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.toast:not(:last-child) {
		margin-bottom: 0.5rem;
	}
</style>
