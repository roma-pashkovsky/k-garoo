<script lang="ts">
	import DetailsPage from '../DetailsPage.svelte';
	import DetailsTopBar from '../DetailsTopBar.svelte';
	import TitleWithEdit from '../TitleWithEdit.svelte';
	import DetailsBody from '../DetailsBody.svelte';
	import ChecklistItem from './ChecklistItem.svelte';
	import BottomMenu from '../BottomMenu.svelte';
	import type { CheckListItem, ChecklistWithSettings, CategoryOption } from '../../types';
	import { getDefaultListName } from '../../utils/get-default-list-name';
	import { getChecklistGroupedByCategory } from '../../utils/get-checklist-grouped-by-category';
	import { getNumericValueFromDescription } from '../../utils/get-numeric-value-from-description';
	import { get } from 'svelte/store';
	import { AppSettingsStore } from '../../stores/app/app-settings';
	import { darkEquivalents } from '../../utils/category-colors';
	import { t } from '../../stores/app/translate.js';
	import { mainListClientRoute } from '../../utils/client-routes';
	import { goto } from '$app/navigation';

	export let isBottomView: boolean;
	export let list: ChecklistWithSettings;

	const darkBG = darkEquivalents;

	$: isByCategoryView = list?.isGroupByCategory ?? false;
	$: isHideCrossedOut = list?.hideCrossedOut || false;
	$: listName = list?.name ?? getDefaultListName();
	$: isCalcMode = list?.isCalcMode;
	$: movedItems = list?.items || [];
	$: displayItems = isHideCrossedOut ? items.filter((it) => !it.checked) : items;
	$: byCategoryList = getChecklistGroupedByCategory(displayItems);
	$: categoryBgColor = (cat: CategoryOption) =>
		(get(AppSettingsStore.theme) === 'light' ? cat.color : darkBG[cat.color]) || '';

	function onBackClick(): void {
		goto(mainListClientRoute());
	}

	function sumItems(items: CheckListItem[]): string {
		const res = (items || []).reduce(
			(p, c) => p + getNumericValueFromDescription(c?.itemDescription),
			0
		);
		return res.toFixed(2);
	}
</script>

<DetailsPage>
	<DetailsTopBar on:back-clicked={onBackClick}>
		<div slot="page-title">
			<div class="flex items-center">
				<TitleWithEdit readOnly={true} bind:title={listName} />
			</div>
		</div>
	</DetailsTopBar>
	<DetailsBody>
		<!--        List-->
		{#if isByCategoryView}
			<!--			By category view-->
			{#each byCategoryList as catItem, catIndex}
				<div
					class="relative rounded-lg bg-{categoryBgColor(catItem.category)} {catIndex === 0
						? ''
						: 'mt-6'}"
				>
					<div onclick="event.stopPropagation()">
						<h5 class="text-gray-600 dark:text-gray-400 text-sm flex items-center">
							<span class="p-2">
								{catItem.category.name}
							</span>
						</h5>
					</div>

					<div class="pl-1">
						{#each catItem.items as item (item.id)}
							<ChecklistItem {item} disabled={true} />
						{/each}
						{#if isCalcMode}
							<div class="flex justify-end py-1.5 mt-2 px-2">
								<div class="w-80 border-t border-gray-500 dark:border-gray-200 text-right">
									{catItem.category.name}: {sumItems(catItem.items)}
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/each}
			<!--			/By category view-->
		{:else}
			<!--		Plain view-->
			{#each displayItems as item (item.id)}
				<ChecklistItem {item} disabled={true} />
			{/each}
			<!--		/Plain view-->
		{/if}
		{#if displayItems?.length && isCalcMode}
			<div class="flex justify-end py-1.5 mt-8 px-2">
				<div class="w-80 border-t border-gray-500 dark:border-gray-200 text-right">
					{$t('lists.details.calculator.total')}: {sumItems(displayItems)}
				</div>
			</div>
		{/if}
		<!--        /List-->
	</DetailsBody>

	<!--Add list to user's collection-->
	{#if isBottomView}
		<BottomMenu onmousedown="event.stopPropagation(); event.preventDefault()">
			<slot name="bottom-view" />
		</BottomMenu>
	{/if}
	<!--EOF Add list to user's collection-->
</DetailsPage>
