<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { AuthStore } from '../stores/login/auth.store';
	import { A, Alert, Button, P, Spinner } from 'flowbite-svelte';
	import { processError } from '../utils/process-error';
	import { t } from '../stores/app/translate';
	import { derived, get } from 'svelte/store';
	import { auth } from '../stores/login/auth';
	import { privacyPolicyClientRoute } from '../utils/client-routes';
	import { AppSettingsStore } from '../stores/app/app-settings';

	const dispatch = createEventDispatcher();
	const authStore = new AuthStore();
	let state: 'idle' | 'google' | 'facebook' | 'merging' = 'idle';
	let keepMyData = true;
	const wrongProvider = derived(auth, ($auth) => $auth.wrongProvider);
	const error = derived(auth, ($auth) => $auth.error);
	const sessionExpired = derived(auth, ($auth) => $auth.isSessionExpired);
	const privacyRoute = derived(AppSettingsStore.lang, ($lang) => privacyPolicyClientRoute($lang));

	async function onLoginWithFacebook(): Promise<void> {
		state = 'facebook';
		try {
			await authStore.loginFacebook(keepMyData);
			if (get(auth).user) {
				dispatch('success');
			}
		} catch (err) {
			processError('Failed to session with facebook', err);
		} finally {
			state = 'idle';
		}
	}

	async function onLoginWithGoogle(): Promise<void> {
		state = 'google';
		try {
			await authStore.loginGoogle(keepMyData);
			if (get(auth).user) {
				dispatch('success');
			}
		} catch (err) {
			processError('Failed to session with google', err);
		} finally {
			state = 'idle';
		}
	}

	async function onMergeAccounts(): Promise<void> {
		state = 'merging';
		try {
			await authStore.linkAccounts(keepMyData);
			if (get(auth).user) {
				dispatch('success');
			}
		} catch (err) {
			processError('Failed to session with google', err);
		} finally {
			state = 'idle';
		}
	}

	function onPrivacyPolicyClick(): void {
		dispatch('privacy-policy-click');
	}
</script>

<div>
	{#if $sessionExpired}
		<Alert class="mb-4">
			{$t('app.login-popup.session-expired')}
		</Alert>
	{/if}
	<Button class="mb-4 w-full" size="md" color="blue" on:click={onLoginWithFacebook}>
		{#if state === 'facebook'}
			<Spinner class="mr-2" size={4} />
		{/if}
		{$t('app.login-popup.facebook-button')}
	</Button>

	<Button class="w-full" size="md" color="light" on:click={onLoginWithGoogle}>
		{#if state === 'google'}
			<Spinner class="mr-2" size={4} />
		{/if}
		{$t('app.login-popup.google-button')}</Button
	>

	{#if $wrongProvider}
		<Alert class="mt-4">
			{$t('app.login-popup.merge-warning')}
			<div class="flex justify-center mt-2">
				<Button size="md" color="blue" on:click={onMergeAccounts}>
					{#if state === 'merging'}
						<Spinner class="mr-2" size={4} />
					{/if}
					{$t('app.login-popup.merge-button-label')}
				</Button>
			</div>
		</Alert>
	{/if}

	{#if $error}
		<Alert class="mt-4" color="red">
			{$error}
		</Alert>
	{/if}

	<P class="mt-4 text-sm">
		{$t('app.login-popup.privacy-policy.using-this-app')}

		<A href={$privacyRoute}
			><div class="inline-block" on:click={onPrivacyPolicyClick}>
				{$t('app.login-popup.privacy-policy.privacy-policy')}
			</div></A
		>
	</P>
</div>
