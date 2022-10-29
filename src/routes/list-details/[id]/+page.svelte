<script lang="ts">
	import ChecklistDetails from '$lib/checklist-details/ChecklistDetails.svelte';
	import type { ChecklistDetailsLoadData } from './checklist-details-load-data';
	import { getDefaultListName } from '../../../utils/get-default-list-name';
	import type { CheckList } from '../../../types';
	import { derived } from 'svelte/store';
	import { listDataStore } from '../../../stores/checklist-details/checklist-details-data';

	export let data: ChecklistDetailsLoadData;

	let listName = data.list?.name || getDefaultListName();
	let list = derived(listDataStore, (listData) => listData[data.listId]);
	let description = getDescription(data.list);
	const url = 'https://k-garoo.fun/list-details/' + data.listId;

	function getDescription(list: CheckList): string {
		if (!list) {
			return 'My checklist';
		} else {
			const items = list.items;
			const count = Math.min(3, items.length);
			let d = '';
			for (let i = 0; i < count; i++) {
				d += `○ ${items[i].itemDescription}`;
				d += '\n';
			}
			return d;
		}
	}
</script>

<svelte:head>
	<title>Garoo - {listName}</title>
	<meta property="og:type" content="article" />
	<meta property="og:url" content={url} />
	<meta property="og:site_name" content="Garoo" />
	<meta property="og:description" content={description} />
	<meta property="og:title" content={listName} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:site" content="@business" />
	<meta name="twitter:title" content={listName} />
</svelte:head>

<ChecklistDetails
	listId={data.listId}
	list={data.list}
	checklistSettings={data.checklistSettings}
/>
