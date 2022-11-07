<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { AuthStore } from '../stores/login/auth.store';
	import { Button, Checkbox } from 'flowbite-svelte';
	import { processError } from '../utils/process-error';
	import { t } from '../stores/app/translate';

	const dispatch = createEventDispatcher();
	const authStore = new AuthStore();
	let isLoading = false;
	let keepMyData = false;

	async function onLoginWithFacebook(): Promise<void> {
		isLoading = true;
		try {
			await authStore.loginFacebook(keepMyData);
			dispatch('success');
		} catch (err) {
			processError('Failed to session with facebook', err);
		} finally {
			isLoading = false;
		}
	}

	async function onLoginWithGoogle(): Promise<void> {
		isLoading = true;
		try {
			await authStore.loginGoogle(keepMyData);
			dispatch('success');
		} catch (err) {
			processError('Failed to session with google', err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div>
	<Button class="mb-4 w-full" color="blue" on:click={onLoginWithFacebook}
		>{$t('app.login-popup.facebook-button')}</Button
	>

	<Button class="w-full" color="light" on:click={onLoginWithGoogle}
		>{$t('app.login-popup.google-button')}</Button
	>

	<Checkbox class="mt-6" bind:checked={keepMyData}
		>{$t('app.login-popup.sync-data-checkbox')}</Checkbox
	>
</div>
