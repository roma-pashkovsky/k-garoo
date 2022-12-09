<script lang="ts">
	import * as rive from '@rive-app/canvas';
	import { onDestroy, onMount } from 'svelte';
	import type { StateMachineInput } from '@rive-app/canvas';
	import type { Theme } from '../../types';

	export let checked: boolean;
	export let theme: Theme;

	let canvas: HTMLCanvasElement;
	let player: rive.Rive;
	let prevChecked: boolean = checked;
	let inputs: StateMachineInput[];

	$: {
		if (player) {
			updateState();
			prevChecked = checked;
		}
	}

	onMount(() => {
		player = new rive.Rive({
			canvas,
			src: theme === 'dark' ? '/white-check.riv' : '/black-check.riv',
			autoplay: true,
			layout: new rive.Layout({ fit: rive.Fit.Cover, alignment: rive.Alignment.TopCenter }),
			stateMachines: 'check-state-machine',
			onLoad: () => {
				inputs = player.stateMachineInputs('check-state-machine');
				updateState();
			}
		});
	});

	onDestroy(() => {
		if (player) {
			try {
				player.cleanup();
			} catch (err) {
				console.log(err);
			}
		}
	});

	function updateState(): void {
		if (!inputs) {
			return;
		}
		if (prevChecked !== checked && !!checked) {
			const checkInput = inputs.find((t) => t.name === 'check');
			checkInput.fire();
			return;
		}
		if (!checked) {
			const uncheckedInput = inputs.find((t) => t.name === 'unchecked');
			uncheckedInput.fire();
		} else {
			const checkedInput = inputs.find((t) => t.name === 'checked');
			checkedInput.fire();
		}
	}
</script>

<div class="relative -top-[2px]">
	<canvas class="canvas" bind:this={canvas} width="60" height="60" />
</div>

<style>
	.canvas {
		transform: scale(0.5);
		transform-origin: 0% 0%;
	}
</style>
