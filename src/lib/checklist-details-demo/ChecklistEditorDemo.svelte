<script lang="ts">
	import DefaultPaneWrap from '../DefaultPaneWrap.svelte';
	import { Button } from 'flowbite-svelte';
	import Gif from '../Gif.svelte';
	import { click_outside } from '../../utils/click-outside';
	import { createEventDispatcher } from 'svelte';
	import { t } from '../../stores/app/translate';
	import { stopMouseEvent } from '../../utils/stop-mouse-event.js';

	let isShown = true;

	let step = 1;
	let maxSteps = 2;
	let leftSwipeSrc = '/img/swipe-left-4.gif';
	let rightSwipeSrc = '/img/swipe-right-2.gif';
	const dispatch = createEventDispatcher();

	function onNext(): void {
		step++;
		isShown = step <= maxSteps;
		dispatch('next-click');
	}
</script>

{#if isShown}
	<div
		use:click_outside
		on:click_outside={onNext}
		class="absolute bottom-24 left-1/2 -translate-x-1/2 w-max"
	>
		{#if step === 1}
			<DefaultPaneWrap paddingClass="p-2">
				<div class="flex items-center" onmousedown={stopMouseEvent}>
					<Gif addClass="block md:hidden" src={leftSwipeSrc} height="38px" />
					<div class="block md:hidden ml-3 text-sm whitespace-nowrap">
						{$t('lists.details.demo.exit-editor')}
					</div>
					<div class="hidden md:block">{$t('lists.details.demo.exit-editor.md')}</div>
					<Button class="!p-2 ml-3 whitespace-nowrap text-blue-600" color="light" on:click={onNext}
						>{$t('lists.details.demo.got-it')}</Button
					>
				</div>
			</DefaultPaneWrap>
		{/if}
		{#if step === 2}
			<DefaultPaneWrap paddingClass="p-2">
				<div class="flex items-center" onmousedown={stopMouseEvent}>
					<Gif addClass="block md:hidden" src={rightSwipeSrc} height="38px" />
					<div class="ml-3 text-sm whitespace-nowrap tracking-tighter block md:hidden">
						{$t('lists.details.demo.submit-editor')}
					</div>
					<div class="hidden md:block">{$t('lists.details.demo.submit-editor.md')}</div>
					<Button class="!p-2 ml-3 whitespace-nowrap text-blue-600" color="light" on:click={onNext}
						>{$t('lists.details.demo.got-it')}</Button
					>
				</div>
			</DefaultPaneWrap>
		{/if}
	</div>
{/if}
