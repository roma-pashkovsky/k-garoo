<script lang="ts">
	import Login from './Login.svelte';
	import { onMount } from 'svelte';
	import { CloseButton, Drawer } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import { t } from '../stores/app/translate.js';
	import { auth, loginClickEvents } from '../stores/login/auth';
	import { click_outside } from '../utils/click-outside';
	import { createEventDispatcher } from 'svelte';

	export let hidden = true;
	const dispatch = createEventDispatcher();

	let transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};

	onMount(() => {
		loginClickEvents.subscribe((ev) => {
			if (ev) {
				hidden = false;
			}
		});
	});

	function onSuccessfulLogin() {
		hidden = true;
	}

	async function onDismiss() {
		hidden = true;
		dispatch('dismiss');
	}
</script>

<Drawer
	position="fixed"
	transitionType="fly"
	{transitionParams}
	bind:hidden
	placement="right"
	class="w-80"
>
	<div use:click_outside on:click_outside={onDismiss} class="w-full h-full">
		<h5
			id="drawer-label"
			class="w-full inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
		>
			{$t('app.login-popup.title')}
			<CloseButton on:click={onDismiss} class="mb-4 dark:text-white" />
		</h5>
		<Login on:success={onSuccessfulLogin} />
	</div>
</Drawer>
