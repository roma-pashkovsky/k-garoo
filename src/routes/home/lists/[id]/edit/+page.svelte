<script lang="ts">
	import ChecklistEditor from '../../../../../lib/list-editor/ChecklistEditor.svelte';
	import type { CheckList } from '../../../../../types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getState } from '../../../../../utils/local-storage-state';
	import EmptyPage from '../../../../../lib/EmptyPage.svelte';

	let list: CheckList;

	onMount(() => {
		const listId = $page.params.id;
		const state = getState();
		const listData = state.listData || {};
		list = listData[listId];
	});
</script>

{#if !!list}
	<ChecklistEditor listId={list.id} listName={list.name} items={list.items} />
{:else}
	<EmptyPage>List not found</EmptyPage>
{/if}
