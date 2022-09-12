<script lang="ts">
	import { page } from '$app/stores';
	import ChecklistDetails from '$lib/checklist-details/ChecklistDetails.svelte';
	import { locale } from '../../../../utils/i18n.js';

	const listId = $page.params.id;
</script>

<ChecklistDetails {listId} bind:locale={$locale} />
