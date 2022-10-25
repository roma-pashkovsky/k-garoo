<script lang="ts">
	import type { AppUser } from '../../../types/auth';
	import UserCard from '../../../lib/UserCard.svelte';
	import { Button, Spinner } from 'flowbite-svelte';
	import { unblockUser } from '../../../stores/stop-list/stop-list.store';
	import { get } from 'svelte/store';
	import { t } from '../../../stores/app/translate';
	export let user: AppUser;

	let isUnblocking = false;

	function onUnblock() {
		if (confirm(get(t)('app.basic-confirm'))) {
			doUnblock();
		}
	}

	async function doUnblock(): Promise<void> {
		try {
			isUnblocking = true;
			await unblockUser(user.id);
		} catch (err) {
			console.error(err);
		} finally {
			isUnblocking = false;
		}
	}
</script>

<UserCard {user}>
	<Button on:click={onUnblock}>
		{#if isUnblocking}
			<Spinner size="4" color="white" class="mr-2" />
		{/if}
		{$t('stop-list.item.unblock-button')}
	</Button>
</UserCard>
