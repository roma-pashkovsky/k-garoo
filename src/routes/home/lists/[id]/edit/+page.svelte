<script lang="ts">
	import ChecklistEditor from '../../../../../lib/ChecklistEditor.svelte';
	import type { CheckList, CheckListItem } from '../../../../../types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getState } from '../../../../../utils/local-storage-state';
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
{/if}
