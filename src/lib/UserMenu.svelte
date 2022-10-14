<script lang="ts">
	import { Avatar, Button, Chevron, Dropdown, DropdownHeader, DropdownItem } from 'flowbite-svelte';
	import { t } from '../stores/app/translate';
	import { AuthStore } from '../stores/login/auth.store';
	import { get } from 'svelte/store';
	import { getRandomElementId } from '../utils/get-random-element-id';

	const authStore = new AuthStore();
	const user = AuthStore.user;
	const id = getRandomElementId(8);

	function onLogOutClicked(): void {
		if (confirm(get(t)('app.basic-confirm'))) {
			authStore.signOut();
		}
	}
</script>

{#if $user}
	<Avatar size="sm" {id} class="ml-3" src={$user.photoUrl} />
	<Dropdown class="z-50" placement="bottom" triggeredBy={'#' + id} frameClass="z-30">
		<DropdownHeader>
			<span class="block text-sm">{$user.displayName}</span>
		</DropdownHeader>
		<DropdownItem on:click={onLogOutClicked}>{$t('app.user-menu.logout')}</DropdownItem>
	</Dropdown>
{/if}
