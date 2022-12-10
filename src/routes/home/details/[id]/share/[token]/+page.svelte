<script lang="ts">
	import ChecklistDetailsReadOnly from '../../../../../../lib/checklist-details/ChecklistDetailsReadOnly.svelte';
	import { onMount } from 'svelte';
	import type { ChecklistDetailsLoadData } from '../../checklist-details-load-data';
	import type { SharedListTokenLoadData } from './shared-list-token-load-data';
	import { sineIn } from 'svelte/easing';
	import { click_outside } from '../../../../../../utils/click-outside';
	import { t } from '../../../../../../stores/app/translate.js';
	import { Alert, CloseButton, Drawer } from 'flowbite-svelte';
	import Login from '../../../../../../lib/Login.svelte';
	import { goto } from '$app/navigation';
	import {
		checklistDetailsClientEditRoute,
		checklistDetailsClientLinkRoute,
		mainListClientRoute
	} from '../../../../../../utils/client-routes';
	import { get } from 'svelte/store';
	import { auth } from '../../../../../../stores/login/auth';
	import { ShareListStore } from '../../../../../../stores/share-list/share-list.store';
	import { ToastService } from '../../../../../../utils/toasts';
	import { getList } from '../../../../../../stores/checklist-details/checklist-details-data';

	export let data: ChecklistDetailsLoadData & SharedListTokenLoadData;

	const list = data.list;
	const listId = data.listId;
	let hidden = false;
	let transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};
	const toastManager = ToastService.getInstance();

	onMount(() => {
		if (data.list.isMyList) {
			goto(checklistDetailsClientEditRoute(data.listId));
		} else if (!data?.token?.verified) {
			goto(checklistDetailsClientLinkRoute(data.listId));
		}
		if (get(auth).user && data.token.verified) {
			applyShareListInviteToken();
		}
	});

	function onDismiss() {
		goto(mainListClientRoute());
	}

	function onSuccessfulLogin(): void {
		applyShareListInviteToken();
	}

	async function applyShareListInviteToken(): Promise<void> {
		try {
			await new ShareListStore().applyShareListInviteToken(listId, data.token.value);
			await getList(listId, true);
			goto(checklistDetailsClientEditRoute(data.listId));
		} catch (err) {
			console.error(err);
			toastManager.push({
				color: 'warning',
				text: 'Failed to apply invite token'
			});
		}
	}
</script>

<ChecklistDetailsReadOnly {list} />

<Drawer
	position="fixed"
	transitionType="fly"
	{transitionParams}
	bind:hidden
	placement="right"
	class="w-80"
>
	<div
		use:click_outside
		on:click_outside={onDismiss}
		class="w-full h-full"
		style="padding-top: env(safe-area-inset-top)"
	>
		<h5
			id="drawer-label"
			class="w-full inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
		>
			{$t('app.login-popup.title')}
			<CloseButton on:click={onDismiss} class="mb-4 dark:text-white" />
		</h5>
		{#if data.token?.verified}
			<Alert class="mb-4">
				{$t('share-list.details-page.invite-alert', { user: data.token?.user?.displayName })}
			</Alert>
		{/if}

		<Login on:success={onSuccessfulLogin} />
	</div>
</Drawer>
