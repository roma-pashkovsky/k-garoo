<script lang="ts">
	let focusInput: HTMLInputElement;
	let targetInput: HTMLInputElement;
	let isOpen = false;

	function onFocus(): void {
		isOpen = !isOpen;
		if (isOpen) {
			targetInput.focus({ preventScroll: true });
		}
	}
</script>

<div class="absolute top-0">
	<input class="h-0" bind:this={focusInput} />
</div>

<div class="h-12 bg-gray-600">Header</div>
<div class="bg-slate-900 flex-1 text-white overflow-y-auto">
	<h1 class="font-bold font-medium mb-4">
		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
		labore et dolore magna aliqua.
	</h1>

	Suspendisse ultrices gravida dictum fusce ut placerat orci nulla pellentesque. Neque sodales ut
	etiam sit amet. Egestas quis ipsum suspendisse ultrices gravida dictum fusce ut placerat. Elit
	pellentesque habitant morbi tristique senectus. Suspendisse ultrices gravida dictum fusce ut
	placerat orci nulla pellentesque. Neque sodales ut etiam sit amet. Egestas quis ipsum suspendisse
	ultrices gravida dictum fusce ut placerat. Elit pellentesque habitant morbi tristique senectus.
	Suspendisse ultrices gravida dictum fusce ut placerat orci nulla pellentesque. Neque sodales ut
	etiam sit amet. Egestas quis ipsum suspendisse ultrices gravida dictum fusce ut placerat. Elit
	pellentesque habitant morbi tristique senectus. Suspendisse ultrices gravida dictum fusce ut
	placerat orci nulla pellentesque. Neque sodales ut etiam sit amet. Egestas quis ipsum suspendisse
	ultrices gravida dictum fusce ut placerat. Elit pellentesque habitant morbi tristique senectus.
	Suspendisse ultrices gravida dictum fusce ut placerat orci nulla pellentesque. Neque sodales ut
	etiam sit amet. Egestas quis ipsum suspendisse ultrices gravida dictum fusce ut placerat. Elit
	pellentesque habitant morbi tristique senectus. Elit pellentesque habitant morbi tristique
	senectus. Suspendisse ultrices gravida dictum fusce ut placerat orci nulla pellentesque. Neque
	sodales ut etiam sit amet. Egestas quis ipsum suspendisse ultrices gravida dictum fusce ut
	placerat. Elit pellentesque habitant morbi tristique senectus. Suspendisse ultrices gravida dictum
	fusce ut placerat orci nulla pellentesque. Neque sodales ut etiam sit amet. Egestas quis ipsum
	suspendisse ultrices gravida dictum fusce ut placerat. Elit pellentesque habitant morbi tristique
	senectus. Suspendisse ultrices gravida dictum fusce ut placerat orci nulla pellentesque. Neque
	sodales ut etiam sit amet. Egestas quis ipsum suspendisse ultrices gravida dictum fusce ut
	placerat. Elit pellentesque habitant morbi tristique senectus.
</div>
<div on:long-press={onFocus} class="h-12 bg-yellow-200">
	<textarea class={isOpen ? 'h-12' : 'h-0'} id="target" bind:this={targetInput} />
</div>
