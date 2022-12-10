<script lang="ts">
	import ChecklistDetailsBody_1 from './ChecklistDetailsBody_1.svelte';
	import ChecklistDetailsBody_2 from './ChecklistDetailsBody_2.svelte';
	import ChecklistDetailsBody_3 from './ChecklistDetailsBody_3.svelte';
	import ChecklistDetailsBody_1_1 from './ChecklistDetailsBody_1_1.svelte';
	import { createEventDispatcher } from 'svelte';
	import ChecklistDetailsBody_4 from './ChecklistDetailsBody_4.svelte';

	export let isShown;
	export let closeOnNext: boolean;
	const dispatch = createEventDispatcher();

	export let currentStep = 1;
	let stepsCount = 5;

	function onForward(): void {
		if (closeOnNext) {
			isShown = false;
		} else {
			currentStep++;
			if (currentStep > stepsCount) {
				isShown = false;
				dispatch('complete');
			}
		}
	}

	function onBack(): void {
		currentStep--;
	}
</script>

{#if isShown}
	<div class="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 z-40" on:click={onForward}>
		<div class="fixed top-1/3 left-1/2 -translate-y-1/2 -translate-x-1/2 z-50">
			{#if currentStep === 1}
				<ChecklistDetailsBody_1 on:forward={onForward} />
			{/if}
			{#if currentStep === 2}
				<ChecklistDetailsBody_1_1 on:forward={onForward} on:back={onBack} />
			{/if}
			{#if currentStep === 3}
				<ChecklistDetailsBody_2 on:forward={onForward} on:back={onBack} />
			{/if}
			{#if currentStep === 4}
				<ChecklistDetailsBody_3 on:forward={onForward} on:back={onBack} />
			{/if}
			{#if currentStep === 5}
				<ChecklistDetailsBody_4 on:forward={onForward} on:back={onBack} />
			{/if}
		</div>
	</div>
{/if}
