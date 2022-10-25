<script lang="ts">
	import type { CheckList } from '../types';

	export let list: CheckList;
</script>

<div class="font-normal text-gray-700 dark:text-gray-400 leading-tight" style="min-height: 44px">
	<ul>
		{#if list?.items?.length}
			<div>
				<li
					class="mb-1 whitespace-nowrap overflow-hidden text-ellipsis w-56 sm:w-64 {list.items[0]
						?.checked
						? 'checked'
						: ''}"
				>
					{list.items[0].itemDescription}
				</li>
			</div>
		{/if}
		{#if list.items?.length > 1}
			<li
				class="whitespace-nowrap overflow-hidden text-ellipsis w-56 sm:w-64 {list.items[1]?.checked
					? 'checked'
					: ''}"
			>
				{list.items[1].itemDescription}
			</li>
		{/if}
	</ul>
</div>
