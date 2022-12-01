<script lang="ts">
	import Page from '../../../lib/Page.svelte';
	import { Button, Drawer, Heading, P } from 'flowbite-svelte';
	import { t } from '../../../stores/app/translate';
	import BottomMenu from '../../../lib/BottomMenu.svelte';
	import { sineIn } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { mainListClientRoute } from '../../../utils/client-routes';

	const transitionParamsBottom = {
		y: 320,
		duration: 200,
		easing: sineIn
	};
	let hidden = false;

	function onGoToLists(): void {
		goto(mainListClientRoute());
	}
</script>

<Page>
	<Heading tag="h4" class="mb-4">{$t('app.initial-popup.add-to-main-section-title')}</Heading>
	<Heading tag="h6" class="mb-2">Android</Heading>
	<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400 pl-12">
		<img src="/img/add-android-1-eng-n.png" width="150" />
	</P>
	<Heading tag="h6" class="mb-2">iPhone</Heading>
	<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400 pl-8 pb-8">
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

<Drawer
	placement="bottom"
	width="w-full"
	transitionType="fly"
	transitionParams={transitionParamsBottom}
	backdrop={false}
	divClass="foo flex justify-center z-40"
	bind:hidden
	id="sidebar8"
>
	<BottomMenu>
		<div class="flex justify-end">
			<Button on:click={onGoToLists}>{$t('add-app-to-home-screen.go-to-lists-button')}</Button>
		</div>
	</BottomMenu>
</Drawer>
