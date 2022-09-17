<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import Gif from '../Gif.svelte';
	import DefaultPaneWrap from '../DefaultPaneWrap.svelte';
	import { t } from '../../utils/i18n.js';
	import { click_outside } from '../../utils/click-outside';

	const dispatch = createEventDispatcher();

	function onForward(): void {
		dispatch('forward');
	}
</script>

<div use:click_outside on:click_outside={onForward}>
	<DefaultPaneWrap>
		<div class="flex justify-center mb-4">
			<Gif src="/img/press-hold-item.gif" width="80" />
		</div>
		{$t('lists.details.demo.edit-item')}
		<div class="flex space-x-2 justify-end mt-3">
			<Button color="default" on:click={onForward} class="text-blue-600"
				>{$t('lists.details.demo.got-it')}</Button
			>
		</div>
	</DefaultPaneWrap>
</div>
