<script lang="ts">
	import ChecklistDetailsReadOnly from '../../../../../lib/checklist-details/ChecklistDetailsReadOnly.svelte';
	import { Button } from 'flowbite-svelte';
	import { t } from '../../../../../stores/app/translate';
	import type { ChecklistDetailsLoadData } from '../checklist-details-load-data';
	import { goto } from '$app/navigation';
	import { checklistDetailsClientRoute } from '../../../../../utils/client-routes';
	import {
		addListToMyCollection,
		loadList
	} from '../../../../../stores/checklist-details/checklist-details-data';
	import { onDestroy, onMount } from 'svelte';
	import { auth } from '../../../../../stores/login/auth';
	import { get } from 'svelte/store';
	import type { Unsubscriber } from 'svelte/store';

	export let data: ChecklistDetailsLoadData;
	const listId = data.listId;
	const list = data.list;
	let unsub: Unsubscriber;

	onMount(() => {
		let prevId = get(auth)?.user?.id;
		unsub = auth.subscribe(async (a) => {
			console.log(a);
			const { user } = a;
			if (user?.id !== prevId) {
				prevId = user?.id;
				if (user?.id) {
					await loadList(listId, true);
					await goto(checklistDetailsClientRoute(listId));
					location.reload();
				}
			}
		});
	});

	onDestroy(() => {
		if (unsub) {
			unsub();
		}
	});

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
