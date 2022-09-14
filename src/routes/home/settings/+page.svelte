<script>
	import Page from '../../../lib/Page.svelte';
	import LocaleSelector from '../../../lib/LocaleSelector.svelte';
	import { t } from '../../../utils/i18n';
	import ThemeSelector from '../../../lib/ThemeSelector.svelte';
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
</Page>
