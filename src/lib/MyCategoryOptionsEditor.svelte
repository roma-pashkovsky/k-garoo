<script lang="ts">
	import { Button, Card, CloseButton, Input } from 'flowbite-svelte';
	import {
		addCategoryOption,
		categoryOptionsByUser,
		removeCategoryOption
	} from '../stores/checklist-details/category-options';
	import { derived, get } from 'svelte/store';
	import { ToastService } from '../utils/toasts';
	import { t } from '../stores/app/translate';
	import { getUID } from '../utils/get-uid';
	import { categoryColors } from '../utils/category-colors';
	import EmptyPage from './EmptyPage.svelte';

	const toastManager = ToastService.getInstance();
	const sorted = derived(categoryOptionsByUser, (source) => {
		if (source) {
			const copy = [...source];
			copy.sort((a, b) => (a.name < b.name ? -1 : 1));
			return copy;
		}
		return [];
	});
	let inputValue: string;

	async function onRemoveCategoryOptionClicked(optionId): Promise<void> {
		try {
			await removeCategoryOption(optionId);
			toastManager.push({
				type: 'page-bottom',
				color: 'success',
				text: get(t)('app.toasts.success')
			});
		} catch (e) {
			console.error(e);
			toastManager.push({
				type: 'page-bottom',
				color: 'warning',
				text: get(t)('app.toasts.failed')
			});
		}
	}

	async function onAddCategoryOption(): Promise<void> {
		try {
			if (!inputValue?.length) {
				return;
			}
			const id = getUID();
			const color = categoryColors[Math.floor(Math.random() * categoryColors.length)];
			const name = inputValue;
			await addCategoryOption({ id, name, color });
			toastManager.push({
				type: 'page-bottom',
				color: 'success',
				text: get(t)('app.toasts.success')
			});
		} catch (err) {
			console.error(err);
			toastManager.push({
				type: 'page-bottom',
				color: 'warning',
				text: get(t)('app.toasts.failed')
			});
		}
	}
</script>

<div>
	<div class="add-input mb-4">
		<form on:submit={onAddCategoryOption} class="flex space-x-2 items-center max-w-[360px]">
			<Input placeholder={$t('settings.categories.add-input-label')} bind:value={inputValue} />
			<Button type="submit">{$t('settings.categories.add-button-label')}</Button>
		</form>
	</div>
	<div class="flex justify-start">
		<div class="options grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4">
			{#if !$sorted.length}
				<EmptyPage>{$t('settings.categories.empty-label')}</EmptyPage>
			{/if}
			{#each $sorted as option}
				<Card rounded={true} border={true} class="!py-4">
					<div
						on:swiped-left={() => onRemoveCategoryOptionClicked(option.id)}
						class="w-full flex space-x-2 justify-start items-center min-w-[170px]"
					>
						<div>
							<CloseButton on:click={() => onRemoveCategoryOptionClicked(option.id)} />
						</div>
						<div>{option.name}</div>
					</div>
				</Card>
			{/each}
		</div>
	</div>
</div>
