<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import Gif from '../Gif.svelte';
	import { t } from '../../stores/app/translate';

	const dispatch = createEventDispatcher();
	let leftSwipeSrc = '/img/swipe-remove-1.gif';

	function onForward(): void {
		dispatch('forward');
	}
</script>

<div
	role="alert"
	in:fade
	class="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg  border border-gray-200 dark:border-gray-700 w-full max-w-xs p-4"
>
	<div class="flex justify-center mb-4">
		<Gif src={leftSwipeSrc} width="80" />
	</div>
	{$t('lists.details.demo.remove-item')}
	<div class="flex space-x-2 justify-end mt-3">
		<Button color="default" on:click={onForward} class="text-blue-600"
			>{$t('lists.details.demo.got-it')}</Button
		>
	</div>
</div>
