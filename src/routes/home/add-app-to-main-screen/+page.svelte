<script lang="ts">
	import Page from '../../../lib/Page.svelte';
	import { Heading, P } from 'flowbite-svelte';
	import { t } from '../../../stores/app/translate';
</script>

<Page>
	<Heading tag="h4" class="mb-4">{$t('app.initial-popup.add-to-main-section-title')}</Heading>
	<Heading tag="h6" class="mb-2">Android</Heading>
	<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400 pl-12">
		<img src="/img/add-android-1-eng-n.png" width="150" />
	</P>
	<Heading tag="h6" class="mb-2">iPhone</Heading>
	<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400 pl-8">
		<div class="step flex space-x-2 mb-4">
			<div class="w-4">1.</div>
			<img class="rounded-lg shadow-md" src="/img/iphone-1-n.png" width="150" />
		</div>
		<div class="step flex space-x-2 mb-4">
			<div class="w-4">2.</div>
			<img class="rounded-lg shadow-md" src="/img/iphone-2-en-n.png" width="150" />
		</div>
		<div class="step flex space-x-2 mb-4">
			<div class="w-4">3.</div>
			<img class="rounded-lg shadow-md" src="/img/iphone-3-en-n.png" width="150" />
		</div>
	</P>
</Page>
