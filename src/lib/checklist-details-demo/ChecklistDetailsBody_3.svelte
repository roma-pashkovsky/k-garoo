<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import DefaultPaneWrap from '../DefaultPaneWrap.svelte';
	import Gif from '../Gif.svelte';

	import { ListBullet } from 'svelte-heros-v2';
	import { t } from '../../stores/app/translate';

	const dispatch = createEventDispatcher();
	let rightSwipeSrc = '/img/swipe-edit-3.gif';
	let isCheckboxView = false;

	onMount(() => {
		setTimeout(() => (isCheckboxView = true), 1500);
	});

	function onForward(): void {
		dispatch('forward');
	}
</script>

<DefaultPaneWrap>
	<div class="flex justify-center mb-4 md:hidden">
		<Gif src={rightSwipeSrc} width="80" />
	</div>
	<span class="md:hidden">{$t('lists.details.demo.batch-edit')}</span>
	<div class="justify-center mb-4 hidden md:flex">
		<Button class="!p-1.5 w-9 h-9" color={isCheckboxView ? 'blue' : 'light'}>
			<ListBullet size="23" />
		</Button>
	</div>
	<span class="hidden md:block">{$t('lists.details.demo.batch-edit.md')}</span>
	<div class="flex space-x-2 justify-end mt-3">
		<Button color="default" on:click={onForward} class="text-blue-600"
			>{$t('lists.details.demo.got-it')}</Button
		>
	</div>
</DefaultPaneWrap>
