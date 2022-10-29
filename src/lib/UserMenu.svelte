<script lang="ts">
	import { Avatar, Badge, Dropdown, DropdownHeader, DropdownItem } from 'flowbite-svelte';
	import { t } from '../stores/app/translate';
	import { AuthStore } from '../stores/login/auth.store';
	import { get } from 'svelte/store';
	import { getRandomElementId } from '../utils/get-random-element-id';
	import { sharedListCount } from '../stores/my-shared-lists/my-shared-list.store';
	import { goto } from '$app/navigation';

	const authStore = new AuthStore();
	const user = AuthStore.user;
	const id = getRandomElementId(8);

	function onGoToRequests(): void {
		goto('/home/requests');
	}

	function onGoToStopList(): void {
		goto('/home/stop-list');
	}

	function onLogOutClicked(): void {
		if (confirm(get(t)('app.basic-confirm'))) {
			authStore.signOut();
		}
	}
</script>

{#if $user}
	<div {id} class="relative">
		<Avatar size="sm" class="ml-3" src={$user.photoUrl} />
		{#if $sharedListCount}
			<div class="absolute" style="right: 0; bottom: 5px">
				<Badge rounded index>{$sharedListCount}</Badge>
			</div>
		{/if}
	</div>
	<Dropdown class="z-50" placement="bottom" triggeredBy={'#' + id} frameClass="z-30">
		<DropdownHeader>
			<span class="block text-sm">{$user.displayName}</span>
		</DropdownHeader>
		<DropdownItem on:click={onGoToRequests}
			>{$t('share-list.requests.title')}
			{#if $sharedListCount}
				<Badge>{$sharedListCount}</Badge>
			{/if}
		</DropdownItem>
		<DropdownItem on:click={onGoToStopList}>{$t('stop-list.page.title')}</DropdownItem>
		<DropdownItem on:click={onLogOutClicked}>{$t('app.user-menu.logout')}</DropdownItem>
	</Dropdown>
{/if}
