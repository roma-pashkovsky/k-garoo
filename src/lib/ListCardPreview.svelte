<script lang="ts">
	import type { CheckList, CheckListItem } from '../types';
	import { onMount } from 'svelte';
	import { getListNMostRelevantItems } from '../utils/get-list-n-most-relevant-items';

	export let list: CheckList;

	let previewItems: CheckListItem[] = [];

	onMount(() => {
		previewItems = getListNMostRelevantItems(list, 3);
	});
</script>

<div class="font-normal text-gray-700 dark:text-gray-400 leading-tight" style="min-height: 44px">
	<ul>
		{#each previewItems as item}
			<li
				class="mb-1 whitespace-nowrap overflow-hidden text-ellipsis w-56 sm:w-64 {item?.checked
					? 'line-through'
					: ''}"
			>
				{item.itemDescription}
			</li>
		{/each}
	</ul>
</div>
