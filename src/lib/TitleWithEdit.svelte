<script lang="ts">
	import { Button, ButtonGroup, Input } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { ArrowRight } from 'svelte-heros-v2';
	import AppTextInput from './AppTextInput.svelte';

	export let title: string;
	let isEditListName = false;
	let isFocused: boolean;
	const dispatch = createEventDispatcher();

	function onEditListNameOpen(): void {
		isEditListName = true;
	}

	function onEditListNameSubmit(): void {
		isEditListName = false;
		dispatch('title-submit');
	}
</script>

{#if isEditListName}
	<form on:submit|preventDefault={onEditListNameSubmit}>
		<ButtonGroup>
			<Button class="!p-0 flex-1 h-9">
				<AppTextInput
					id="list-name"
					autofocus
					autocomplete="off"
					type="text"
					bind:value={title}
					on:blur={onEditListNameSubmit}
					on:focus={() => (isFocused = true)}
				/>
			</Button>
			<Button class="!p-1.5 h-9 w-8" color="blue" type="submit">
				<ArrowRight />
			</Button>
		</ButtonGroup>
	</form>
{:else}
	<h3
		on:click|stopPropagation={onEditListNameOpen}
		class="font-medium text-base sm:text-2xl select-none"
	>
		{title}
	</h3>
{/if}
