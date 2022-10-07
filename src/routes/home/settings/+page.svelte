<script lang="ts">
	import Page from '../../../lib/Page.svelte';
	import LocaleSelector from '../../../lib/LocaleSelector.svelte';
	import ThemeSelector from '../../../lib/ThemeSelector.svelte';
	import { Alert, Button, Spinner } from 'flowbite-svelte';
	import { CleanDataStore } from '../../../stores/app/clean-data-store.js';
	import { ToastService } from '../../../utils/toasts';
	import { t } from '../../../stores/app/translate';

	const cleanDataStore = new CleanDataStore();
	const toastManager = ToastService.getInstance();
	let isCleaningData = false;

	async function onCleanAllData(): Promise<void> {
		if (confirm(($t as any)('app.basic-confirm'))) {
			isCleaningData = true;
			try {
				await cleanDataStore.cleanAllData();
				toastManager.push({
					text: ($t as any)('settings.data.clean-data.toast-success'),
					color: 'success',
					type: 'page-bottom'
				});
			} catch (err) {
				console.error(err);
				toastManager.push({
					text: ($t as any)('settings.data.clean-data.toast-failed'),
					type: 'page-bottom'
				});
			} finally {
				isCleaningData = false;
			}
		}
	}
</script>

<svelte:head>
	<title>K-garoo - {$t('app.sections.settings')}</title>
</svelte:head>

<Page>
	<!--		Locale-->
	<div class="mb-8">
		<h4 class="font-medium mb-4">{$t('settings.header.language')}</h4>
		<p class="pl-10">
			<LocaleSelector />
		</p>
	</div>

	<!--		Theme-->
	<div class="mb-8">
		<h4 class="font-medium mb-4">{$t('settings.header.theme')}</h4>
		<p class="pl-10">
			<ThemeSelector />
		</p>
	</div>

	<!--	Clean data-->
	<div id="clean" name="clean" class="mb-8">
		<h4 class="font-medium mb-4">{$t('settings.header.data')}</h4>
		<div class="my-3 pl-10" style="max-width: 400px">
			<Alert color="red">
				<svg
					slot="icon"
					aria-hidden="true"
					class="w-5 h-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
					><path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clip-rule="evenodd"
					/></svg
				>
				<span class="text-lg font-medium">{$t('settings.data.clean-data.warning-title')}</span>
				<div slot="extra">
					<div class="mt-2 mb-4 text-sm">
						{$t('settings.data.clean-data.warning-body')}
					</div>
				</div>
			</Alert>
		</div>

		<p class="pl-10">
			<Button outline on:click={onCleanAllData} color="red">
				{#if isCleaningData}
					<Spinner class="mr-3" size="4" />
				{/if}
				{$t('settings.data.clean-data-button')}</Button
			>
		</p>
	</div>
</Page>
