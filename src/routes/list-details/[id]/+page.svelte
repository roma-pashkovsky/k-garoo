<script lang="ts">
	import ChecklistDetails from '$lib/checklist-details/ChecklistDetails.svelte';
	import type { ChecklistDetailsLoadData } from './checklist-details-load-data';
	import { getDefaultListName } from '../../../utils/get-default-list-name';
	import type { CheckList } from '../../../types';

	export let data: ChecklistDetailsLoadData;

	let listName = data.list?.name || getDefaultListName();
	let description = getDescription(data.list);

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
	<meta property="og:site_name" content="Garoo" />
	<meta property="og:description" content={description} />
	<meta property="og:title" content={listName} />
	<meta property="og:image" content="https://www.garoo.fun/logo-blue.png" />
</svelte:head>

<ChecklistDetails
	listId={data.listId}
	list={data.list}
	checklistSettings={data.checklistSettings}
/>
