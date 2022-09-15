<script lang="ts">
	import ChecklistDetailsBody_1 from './ChecklistDetailsBody_1.svelte';
	import ChecklistDetailsBody_2 from './ChecklistDetailsBody_2.svelte';
	import ChecklistDetailsBody_3 from './ChecklistDetailsBody_3.svelte';

	export let isShown;
	export let closeOnNext: boolean;

	export let currentStep = 1;
	let stepsCount = 4;

	function onForward(): void {
		if (closeOnNext) {
			isShown = false;
		} else {
			currentStep++;
			if (currentStep > stepsCount) isShown = false;
		}
	}

	function onBack(): void {
		currentStep--;
	}
</script>

{#if isShown}
	<div class="fixed top-1/3 left-1/2 -translate-y-1/2 -translate-x-1/2">
		{#if currentStep === 1}
			<ChecklistDetailsBody_1 on:forward={onForward} />
		{/if}
		{#if currentStep === 2}
			<ChecklistDetailsBody_2 on:forward={onForward} on:back={onBack} />
		{/if}
		{#if currentStep === 3}
			<ChecklistDetailsBody_3 on:forward={onForward} on:back={onBack} />
		{/if}
	</div>
{/if}
