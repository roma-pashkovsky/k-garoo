<script lang="ts">
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { ArrowRight } from 'svelte-heros-v2';
	import AppTextInput from './AppTextInput.svelte';
	import { getDefaultListName } from '../utils/get-default-list-name';

	export let title: string;
	export let isFocused: boolean;
	export let readOnly: boolean;
	let isEditListName = false;
	const dispatch = createEventDispatcher();

	function onEditListNameOpen(): void {
		if (readOnly) {
			return;
		}
		isEditListName = true;
	}

	function onEditListNameSubmit(): void {
		isEditListName = false;
		title = title?.length ? title : getDefaultListName();
		dispatch('title-submit');
	}
</script>

{#if isEditListName}
	<form on:submit|preventDefault={onEditListNameSubmit} class="inline-block w-full">
		<ButtonGroup class="!w-full">
			<Button class="!pt-0 !pb-0 !pr-0 !pl-2 flex-1 h-9">
				<AppTextInput
					id="list-name"
					autofocus
					autocomplete="off"
					type="text"
					selectOnInit={true}
					bind:value={title}
					on:focus={() => (isFocused = true)}
					on:blur={onEditListNameSubmit}
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
		class="font-medium text-base sm:text-2xl select-none inline-block w-full dark:text-white"
	>
		{title}
	</h3>
{/if}
