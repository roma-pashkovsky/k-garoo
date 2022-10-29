<script lang="ts">
	import UserCard from './UserCard.svelte';
	import { CloseButton, Drawer } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import {
		loadUsersByList,
		usersByListDrawerStore,
		usersByListStore
	} from '../stores/checklist-details/users-by-list';
	import { derived } from 'svelte/store';
	import { sineIn } from 'svelte/easing';
	import { listDataStore } from '../stores/checklist-details/checklist-details-data';

	let hidden = true;
	let transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};

	const list = derived([usersByListDrawerStore, listDataStore], ([drawer, data]) => {
		if (drawer) {
			return data[drawer.listId];
		} else {
			return null;
		}
	});

	const users = derived([usersByListDrawerStore, usersByListStore], ([drawer, data]) => {
		if (!drawer) {
			return [];
		} else {
			return data[drawer.listId] || [];
		}
	});

	onMount(() => {
		usersByListDrawerStore.subscribe((v) => {
			if (v) {
				const listId = v.listId;
				loadUsersByList(listId);
				hidden = false;
			} else {
				hidden = true;
			}
		});
	});
</script>

<Drawer
	bind:hidden
	placement="right"
	class="w-80"
	position="fixed"
	transitionType="fly"
	{transitionParams}
>
	<h5
		id="drawer-label"
		class="w-full inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
	>
		{$list?.name}
		<CloseButton on:click={() => (hidden = true)} class="mb-4 dark:text-white" />
	</h5>

	{#each $users as user}
		<UserCard {user} />
	{/each}
</Drawer>
