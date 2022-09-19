<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import DefaultPaneWrap from '../DefaultPaneWrap.svelte';
	import Gif from '../Gif.svelte';
	import { t } from '../../utils/i18n.js';

	const dispatch = createEventDispatcher();
	let useCategoriesGif = '/img/view-by-category.gif';

	function onForward(): void {
		dispatch('forward');
	}
</script>

<DefaultPaneWrap>
	<div class="flex justify-center mb-4">
		<Gif src={useCategoriesGif} width="80" />
	</div>
	{$t('lists.details.demo.use-categories')}
	<div class="flex space-x-2 justify-end mt-3">
		<Button color="default" on:click={onForward} class="text-blue-600"
			>{$t('lists.details.demo.got-it')}</Button
		>
	</div>
</DefaultPaneWrap>
