<script lang="ts">
	import { derived } from 'svelte/store';
	import type { Readable } from 'svelte/store';
	import {
		loadUsersByList,
		usersByListDrawerStore,
		usersByListStore
	} from '../stores/checklist-details/users-by-list';
	import { onMount } from 'svelte';
	import { Avatar } from 'flowbite-svelte';
	import type { AppUser } from '../types/auth';

	export let listId: string;
	export let position: 'vertical' | 'horizontal' = 'vertical';
	export let border: boolean;
	export let bg: boolean;
	export let addWrapperClass = '';

	onMount(() => {
		loadUsersByList(listId);
	});

	export const users: Readable<AppUser[]> = derived(usersByListStore, (data) => data[listId] || []);
	const displayUsers = derived(users, (u) => {
		return (u || []).slice(0, 2);
	});

	function onClick(): void {
		usersByListDrawerStore.set({ listId });
	}
</script>

{#if $users.length}
	<div
		class="inline-flex {position === 'vertical'
			? 'flex-col pt-1'
			: 'items-center pr-1'} rounded-md {border
			? 'border border-gray-200  dark:border-gray-600'
			: ''} {bg ? 'bg-gray-200 dark:bg-gray-600' : ''} {addWrapperClass}"
		on:click|stopPropagation|preventDefault={onClick}
	>
		{#each $displayUsers as user}
			<div class="rounded p-1">
				<Avatar rounded={true} src={user.photoUrl || null} size="xs" />
			</div>
		{/each}
		<div class="text-gray-500 dark:text-gray-200 flex items-center justify-center text-xs p-1">
			{$users.length}
		</div>
	</div>
{/if}
