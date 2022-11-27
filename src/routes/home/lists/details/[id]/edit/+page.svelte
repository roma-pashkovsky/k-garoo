<script lang="ts">
	import ChecklistDetails from '../../../../../../lib/checklist-details/ChecklistDetails.svelte';
	import type { ChecklistWithSettings } from '../../../../../../types';
	import type { ChecklistDetailsLoadData } from '../checklist-details-load-data';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		checklistDetailsClientEditRoute,
		checklistDetailsClientLinkRoute
	} from '../../../../../../utils/client-routes';

	export let data: ChecklistDetailsLoadData;

	const listId = data.listId;
	const list: ChecklistWithSettings = data.list;

	onMount(async () => {
		if (list && !list.isMyList) {
			if (data.childListId) {
				await goto(checklistDetailsClientEditRoute(data.childListId));
				location.reload();
			} else {
				goto(checklistDetailsClientLinkRoute(listId));
			}
		}
	});
</script>

<ChecklistDetails {listId} {list} />
