<script lang="ts">
	import {
		Alert,
		Avatar,
		Button,
		CloseButton,
		Drawer,
		Heading,
		Input,
		Spinner
	} from 'flowbite-svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { ShareListStore } from '../../stores/share-list/share-list.store';
	import type { ShareListUser } from '../../types/share-list';
	import { get, writable } from 'svelte/store';
	import { t } from '../../stores/app/translate.js';
	import { loadUsersByList } from '../../stores/checklist-details/users-by-list';
	import { sineIn } from 'svelte/easing';
	import { closeShareList, shareListIdStore } from '../../stores/app/share-list-drawer.store';
	import { getUID } from '../../utils/get-uid';

	let shareDrawerHidden: boolean;
	const transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};
	const dispatch = createEventDispatcher();
	const store = new ShareListStore();
	let inputValue = '';

	let items: ShareListUser[] = [];
	let recentItems: ShareListUser[] = [];
	const isSharedStore = writable({});
	let isCopyingShareInviteToken = false;
	let isCopyingShareInviteTokenSuccess = false;
	let copyingShareInviteTokenError = false;

	onMount(async () => {
		shareListIdStore.subscribe(async ({ listId }) => {
			if (listId) {
				shareDrawerHidden = false;
				isCopyingShareInviteTokenSuccess = false;
				copyingShareInviteTokenError = false;
				recentItems = await store.recentUsers(listId);
				updateIsSharedStore(recentItems);
			} else {
				shareDrawerHidden = true;
			}
		});
	});

	async function onSearchUsers(): Promise<void> {
		items = await store.searchUsers($shareListIdStore.listId, inputValue);
		updateIsSharedStore(items);
	}

	async function onShareList(userId: string): Promise<void> {
		try {
			await store.shareList($shareListIdStore.listId, userId);
			setIsSharedStore(userId, true);
			loadUsersByList($shareListIdStore.listId);
		} catch (err) {
			console.log(err);
		}
	}

	async function onUnShareList(userId: string): Promise<void> {
		try {
			await store.unShareList($shareListIdStore.listId, userId);
			setIsSharedStore(userId, false);
			loadUsersByList($shareListIdStore.listId);
		} catch (err) {
			console.log(err);
		}
	}

	function updateIsSharedStore(items: ShareListUser[]): void {
		const curr = (items || []).reduce((p, c) => ({ ...p, [c.id]: c.isShared }), {});
		isSharedStore.update((prev) => ({ ...prev, ...curr }));
	}

	function setIsSharedStore(userId: string, shared: boolean): void {
		isSharedStore.update((prev) => ({ ...prev, [userId]: shared }));
	}

	async function onCopyShareInviteList(): Promise<void> {
		isCopyingShareInviteToken = true;
		isCopyingShareInviteTokenSuccess = false;
		copyingShareInviteTokenError = false;
		try {
			const token = getUID();
			const link =
				window.origin + `/home/lists/details/${get(shareListIdStore).listId}/share/${token}`;
			await navigator.clipboard.writeText(link);
			await store.registerShareListInviteToken(get(shareListIdStore).listId, token);
			isCopyingShareInviteTokenSuccess = true;
			if (navigator && navigator.share) {
				await navigator.share({ url: link }).catch((err) => console.log(err));
			}
		} catch (err) {
			console.error(err);
			copyingShareInviteTokenError = true;
		} finally {
			isCopyingShareInviteToken = false;
		}
	}
</script>

<Drawer
	transitionType="fly"
	{transitionParams}
	bind:hidden={shareDrawerHidden}
	position="fixed"
	placement="right"
	class="w-80"
	id="share-drawer"
>
	{#if $shareListIdStore.listId}
		<div class="flex items-center" style="padding-top: env(safe-area-inset-top)">
			<h5
				id="drawer-label"
				class="inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
			>
				{$t('share-list.modal.title')}
			</h5>
			<CloseButton on:click={closeShareList} class="mb-4 dark:text-white" />
		</div>

		<form action="#" class="mb-6">
			<div class="mb-6">
				<Input
					bind:value={inputValue}
					id="user-name"
					name="user-name"
					placeholder={$t('share-list.modal.user-search-placeholder')}
					on:input={onSearchUsers}
				/>
			</div>
		</form>

		<div class="list">
			{#each items as item}
				<div class="flex items-center space-x-4 my-2 py-2">
					<Avatar src={item.photoUrl} alt="user image" class="flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 truncate dark:text-white">
							{item.displayName}
						</p>
					</div>
					<div
						class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
					>
						{#if $isSharedStore[item.id]}
							<Button size="xs" on:click={() => onUnShareList(item.id)}
								>{$t('share-list.modal.unshare-button')}</Button
							>
						{:else}
							<Button size="xs" outline on:click={() => onShareList(item.id)}
								>{$t('share-list.modal.share-button')}</Button
							>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		{#if recentItems?.length && !inputValue?.length}
			<div>
				<Heading tag="h8">{$t('share-list.modal.recent')}</Heading>
				{#each recentItems as item}
					<div class="flex items-center space-x-4 my-2 py-2">
						<Avatar src={item.photoUrl} alt="user image" class="flex-shrink-0" />
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 truncate dark:text-white">
								{item.displayName}
							</p>
						</div>
						<div
							class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
						>
							{#if $isSharedStore[item.id]}
								<Button size="xs" on:click={() => onUnShareList(item.id)}
									>{$t('share-list.modal.unshare-button')}</Button
								>
							{:else}
								<Button size="xs" outline on:click={() => onShareList(item.id)}
									>{$t('share-list.modal.share-button')}</Button
								>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<div class="mt-2 pt-4">
			<div class="mb-2 text-gray-600 dark:text-gray-200 flex items-center">
				<div class="border-t flex-1" />
				<div class="mx-4">{$t('share-list.modal.or')}</div>
				<div class="border-t flex-1" />
			</div>
			<div class="flex justify-center ">
				<Button size="md" outline on:click={onCopyShareInviteList}>
					{$t('share-list.modal.copy-invite-link')}
				</Button>
			</div>
			{#if isCopyingShareInviteToken}
				<div class="flex justify-center">
					<Spinner class="my-2" size={4} />
				</div>
			{/if}
			{#if isCopyingShareInviteTokenSuccess}
				<div class="flex justify-center mt-4">
					<Alert class="text-xs">
						{$t('app.toasts.success')}
					</Alert>
				</div>
			{/if}
			{#if copyingShareInviteTokenError}
				<div class="flex justify-center mt-4">
					<Alert class="text-xs">
						{$t('app.toasts.failed')}
					</Alert>
				</div>
			{/if}
		</div>
	{/if}
</Drawer>
