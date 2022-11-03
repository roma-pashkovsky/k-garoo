<script lang="ts">
	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';
	import { derived, get, writable } from 'svelte/store';
	import {
		createList,
		getList,
		listDataStore,
		updateList
	} from '../../../../stores/checklist-details/checklist-details-data';
	import { page } from '$app/stores';
	import DetailsPage from '../../../../lib/DetailsPage.svelte';
	import DetailsTopBar from '../../../../lib/DetailsTopBar.svelte';
	import DetailsBody from '../../../../lib/DetailsBody.svelte';
	import { Button, Li, List, Textarea } from 'flowbite-svelte';
	import { parseListFromText } from '../../../../utils/parse-list-from-text';
	import type { CheckListItem } from '../../../../types';
	import BottomMenu from '../../../../lib/BottomMenu.svelte';
	import { goto } from '$app/navigation';
	import { ToastService } from '../../../../utils/toasts';
	import { t } from '../../../../stores/app/translate';
	import { updatePropositionsWithItems } from '../../../../stores/checklist-details/propositions';
	import { getDefaultListName } from '../../../../utils/get-default-list-name';

	const listId = $page.params.id;
	const list = derived(listDataStore, (data) => data[listId]);
	const listName = derived(list, ($list) => $list?.name || getDefaultListName());
	const text = writable('');
	const parsedItems: Readable<CheckListItem[]> = derived(text, (v) =>
		v ? parseListFromText(v) : []
	);
	const toastManager = ToastService.getInstance();

	onMount(() => {
		getList(listId, true);
	});

	async function onAddPressed(): Promise<void> {
		const parsed = get(parsedItems);
		if (parsed.length) {
			try {
				const currList = get(list);
				const prevLength = currList?.items?.length || 0;
				parsed.forEach((p) => (p.orderAdded += prevLength * 200));
				if (!currList) {
					await createList({ id: listId, name: get(listName), items: parsed });
				} else {
					await updateList({ id: listId, items: { added: parsed } });
				}
				updatePropositionsWithItems(parsed);
				toastManager.push({
					type: 'page-bottom',
					color: 'success',
					text: get(t)('app.toasts.success')
				});
				goto(`/list-details/${listId}`);
			} catch (err) {
				console.error(err);
				toastManager.push({
					type: 'page-bottom',
					color: 'warning',
					text: get(t)('app.toasts.failed')
				});
			}
		}
	}

	function onBackClick(): void {
		goto(`/list-details/${listId}`);
	}
</script>

<DetailsPage>
	<DetailsTopBar on:back-clicked={onBackClick}>
		<div slot="page-title">
			{$t('lists.details.add-from-text.title-prefix')} "{$listName}"
		</div>
	</DetailsTopBar>
	<DetailsBody>
		<Textarea
			id="text-list"
			bind:value={$text}
			placeholder={$t('lists.details.add-from-text.placeholder')}
			rows="15"
		/>

		<List tag="ul" class="space-y-1">
			{#each $parsedItems as item}
				<Li>{item.itemDescription}</Li>
			{/each}
		</List>
	</DetailsBody>
</DetailsPage>

<BottomMenu>
	<div class="flex justify-end">
		<Button on:click={onAddPressed}>{$t('lists.details.add-from-text.add-button')}</Button>
	</div>
</BottomMenu>
