<script lang="ts">
	import { Badge, Tooltip } from 'flowbite-svelte';
	import { t } from '../../stores/app/translate';

	export let show: boolean;
</script>

{#if show}
	<div
		class="inline-block ml-2"
		onmousedown="event.stopPropagation(); event.preventDefault()"
		onmouseup="event.preventDefault(); event.stopPropagation()"
	>
		<Badge id="badge" color="yellow">!</Badge>
		<Tooltip trigger="click" triggeredBy="#badge"
			>{$t('lists.details.duplicate-item-badge')}</Tooltip
		>
	</div>
{/if}
