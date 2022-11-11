<script lang="ts">
	import Login from './Login.svelte';
	import { onMount } from 'svelte';
	import { CloseButton, Drawer } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import { t } from '../stores/app/translate.js';
	import { loginClickEvents } from '../stores/login/auth';
	import { invalidAuthEventStore } from '../utils/app-fetch';

	export let hidden = true;

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
</script>

<Drawer
	position="fixed"
	transitionType="fly"
	{transitionParams}
	bind:hidden
	placement="right"
	class="w-80"
>
	<div class="w-full">
		<h5
			id="drawer-label"
			class="w-full inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
		>
			{$t('app.login-popup.title')}
			<CloseButton on:click={() => (hidden = true)} class="mb-4 dark:text-white" />
		</h5>
		<Login on:success={onSuccessfulLogin} />
	</div>
</Drawer>
