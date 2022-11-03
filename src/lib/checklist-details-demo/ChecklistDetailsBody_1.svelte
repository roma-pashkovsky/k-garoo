<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { t } from '../../stores/app/translate';

	const dispatch = createEventDispatcher();

	function onForward(): void {
		dispatch('forward');
	}
</script>

<div
	role="alert"
	in:fade
	class="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg  border border-gray-200 dark:border-gray-700 w-full max-w-xs p-4"
>
	<div class="flex justify-center">
		<img src="/img/double-click-2.gif" width="80" />
	</div>
	{$t('lists.details.demo.add')}
	<div class="flex space-x-2 justify-end mt-3">
		<Button color="light" on:click={onForward} class="text-blue-600"
			>{$t('lists.details.demo.got-it')}</Button
		>
	</div>
</div>
