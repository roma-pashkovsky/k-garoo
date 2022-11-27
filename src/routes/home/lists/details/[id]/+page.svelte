<script lang="ts">
	import type { ChecklistDetailsLoadData } from './checklist-details-load-data';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		checklistDetailsClientEditRoute,
		checklistDetailsClientLinkRoute
	} from '../../../../../utils/client-routes';

	export let data: ChecklistDetailsLoadData;

	onMount(() => {
		if (data.list && !data.list.isMyList) {
			if (data.childListId) {
				goto(checklistDetailsClientEditRoute(data.childListId));
			} else {
				goto(checklistDetailsClientLinkRoute(data.listId));
			}
		} else {
			goto(checklistDetailsClientEditRoute(data.listId));
		}
	});
</script>
