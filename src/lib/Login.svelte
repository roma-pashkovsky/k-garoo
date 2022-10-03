<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { AuthStore } from '../stores/login/auth.store';
	import { Button } from 'flowbite-svelte';
	import { processError } from '../utils/process-error';
	import { t } from '../utils/i18n.js';

	const dispatch = createEventDispatcher();
	const authStore = new AuthStore();
	let isLoading = false;

	async function onLoginWithFacebook(): Promise<void> {
		isLoading = true;
		try {
			await authStore.loginFacebook();
			dispatch('success');
		} catch (err) {
			processError('Failed to login with facebook', err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div>
	<Button color="blue" on:click={onLoginWithFacebook}
		>{$t('app.login-popup.facebook-button')}</Button
	>
</div>
