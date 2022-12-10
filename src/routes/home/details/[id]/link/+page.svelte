<script lang="ts">
	import ChecklistDetailsReadOnly from '../../../../../lib/checklist-details/ChecklistDetailsReadOnly.svelte';
	import { Button } from 'flowbite-svelte';
	import { t } from '../../../../../stores/app/translate';
	import type { ChecklistDetailsLoadData } from '../checklist-details-load-data';
	import { goto } from '$app/navigation';
	import { checklistDetailsClientRoute } from '../../../../../utils/client-routes';
	import { addListToMyCollection } from '../../../../../stores/checklist-details/checklist-details-data';

	export let data: ChecklistDetailsLoadData;
	const listId = data.listId;
	const list = data.list;

	async function onAddListToMyCollectionClicked(): Promise<void> {
		const id = await addListToMyCollection(list, listId);
		await goto(checklistDetailsClientRoute(id));
	}
</script>

<ChecklistDetailsReadOnly {list} isBottomView={true}>
	<div slot="bottom-view" class="w-full flex justify-end py-4 px-4">
		<div class="mr-4 flex items-center">
			{$t('lists.details.add-to-my-lists-warning')}
		</div>
		<Button on:click={onAddListToMyCollectionClicked}
			>{$t('lists.details.add-to-my-lists-button')}</Button
		>
	</div>
</ChecklistDetailsReadOnly>
