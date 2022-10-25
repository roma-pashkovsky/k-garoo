<script lang="ts">
	import { get, writable } from 'svelte/store';
	import type { SharedList } from '../types/share-list';
	import { onMount } from 'svelte';
	import { Button, Card, Spinner } from 'flowbite-svelte';
	import ListCardPreview from './ListCardPreview.svelte';
	import UserCard from './UserCard.svelte';
	import {
		acceptList,
		blockUser,
		rejectList
	} from '../stores/my-shared-lists/my-shared-list.store';
	import { ToastService } from '../utils/toasts';
	import { t } from '../stores/app/translate';

	export let listId: string;

	const list = writable<SharedList | null>(null);
	let isAccepting: boolean;
	let isRejecting: boolean;
	let isBlocking: boolean;
	const toasts = ToastService.getInstance();

	onMount(async () => {
		try {
			const resp = await fetch(`/api/v1/my-shared-lists/${listId}`, { method: 'GET' });
			const l = await resp.json();
			list.set(l);
		} catch (err) {
			console.log(err);
		}
	});

	async function onAccept(): Promise<void> {
		try {
			isAccepting = true;
			await acceptList(listId);
			toasts.push({
				type: 'page-bottom',
				color: 'success',
				text: get(t)('app.toasts.success')
			});
		} catch (err) {
			console.error(err);
			toasts.push({
				type: 'page-bottom',
				color: 'warning',
				text: get(t)('app.toasts.failed')
			});
		} finally {
			isAccepting = false;
		}
	}

	async function onReject(): Promise<void> {
		try {
			isRejecting = true;
			await rejectList(listId);
			toasts.push({
				type: 'page-bottom',
				color: 'success',
				text: get(t)('app.toasts.success')
			});
		} catch (err) {
			console.error(err);
			toasts.push({
				type: 'page-bottom',
				color: 'warning',
				text: get(t)('app.toasts.failed')
			});
		} finally {
			isRejecting = false;
		}
	}

	function onBlockUser(userId: string): void {
		if (confirm(get(t)('app.basic-confirm'))) {
			doBlockUser(userId);
		}
	}

	async function doBlockUser(userId: string): Promise<void> {
		try {
			isBlocking = true;
			await blockUser(userId);
			toasts.push({
				type: 'page-bottom',
				color: 'success',
				text: get(t)('app.toasts.success')
			});
		} catch (err) {
			console.error(err);
			toasts.push({
				type: 'page-bottom',
				color: 'warning',
				text: get(t)('app.toasts.failed')
			});
		} finally {
			isBlocking = false;
		}
	}
</script>

<Card class="!p-4 !shadow-sm hover:bg-gray-50 cursor-pointer w-80 relative h-64">
	{#if $list}
		<h5
			class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis"
			style="min-height: 30px"
		>
			{$list.name}
		</h5>
		<ListCardPreview list={$list} />
		<div class="p-2 text-xs pt-2 mt-4 border-t border-t-gray-200">
			<div class="text-gray-500">{$t('share-list.requests.shared-by')}</div>
			<UserCard size="xs" user={$list.sharedBy} />
		</div>
		<div class="justify-center items-center sm:flex sm:space-y-0 space-x-2 sm:space-x-4">
			<Button size="xs" on:click={onAccept} class="w-20">
				{#if isAccepting}
					<Spinner class="mr-3" size="3" color="white" />
				{/if}
				{$t('share-list.requests.accept-button')}
			</Button>
			<Button size="xs" outline on:click={onReject} class="w-20">
				{#if isRejecting}
					<Spinner class="mr-3" size="4" />
				{/if}
				{$t('share-list.requests.reject-button')}
			</Button>
			<Button
				size="xs"
				class="w-24"
				outline
				color="red"
				on:click={() => onBlockUser($list.sharedBy.id)}
				>{$t('share-list.requests.block-user-button')}</Button
			>
		</div>
	{/if}
</Card>
