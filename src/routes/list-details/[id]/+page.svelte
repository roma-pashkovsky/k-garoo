<script lang="ts">
	import ChecklistDetails from '$lib/checklist-details/ChecklistDetails.svelte';
	import type { ChecklistDetailsLoadData } from './checklist-details-load-data';

	export let data: ChecklistDetailsLoadData;
</script>

<ChecklistDetails
	listId={data.listId}
	store={data.store}
	list={data.list}
	checklistSettings={data.checklistSettings}
/>
