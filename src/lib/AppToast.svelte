<script lang="ts">
	import type { Toast as ToastType } from '../utils/toasts';
	import { Toast } from 'flowbite-svelte';
	import { fly } from 'svelte/transition';
	import { t } from '../stores/app/translate';

	export let toast: ToastType;
</script>

{#if toast?.color === 'default'}
	<Toast simple={true}>{toast.text}</Toast>
{/if}

{#if toast?.color === 'warning'}
	<Toast transition={fly} params={{ x: 200 }} simple={true} color="yellow">
		<svelte:fragment slot="icon">
			<div>!</div>
			<span class="sr-only">Warning icon</span>
		</svelte:fragment>
		{toast.text}
	</Toast>
{/if}

{#if toast?.color === 'success'}
	<Toast transition={fly} params={{ x: 200 }} simple={true} color="green">
		<svelte:fragment slot="icon">
			<svg
				aria-hidden="true"
				class="w-5 h-5"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
				><path
					fill-rule="evenodd"
					d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
					clip-rule="evenodd"
				/></svg
			>
			<span class="sr-only">Check icon</span>
		</svelte:fragment>
		{toast.text}
		{#if !!toast.onCancel}<button
				class="text-sm font-medium text-blue-600 p-1.5 hover:bg-blue-100 rounded-lg dark:text-blue-500 dark:hover:bg-gray-700"
				on:click={toast.onCancel}>{$t('app.undo')}</button
			>{/if}
	</Toast>
{/if}
