<script lang="ts">
	import ChecklistDetails from '$lib/checklist-details/ChecklistDetails.svelte';
	import type { ChecklistDetailsLoadData } from './checklist-details-load-data';

	export let data: ChecklistDetailsLoadData;
</script>

<ChecklistDetails
	listId={data.listId}
	locale={data.locale}
	store={data.store}
	list={data.list}
	propositions={data.propositions}
	checklistSettings={data.checklistSettings}
/>
