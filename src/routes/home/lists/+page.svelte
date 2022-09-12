<script lang="ts">
	import { Card, Button, Spinner, DropdownItem } from 'flowbite-svelte';
	import { DocumentRemove, Plus } from 'svelte-heros';
	import { goto } from '$app/navigation';
	import { getState, setState } from '../../../utils/local-storage-state';
	import { locale, t, translate } from '../../../utils/i18n';
	import type { KGarooState, CheckList } from '../../../types';
	import EmptyPage from '../../../lib/EmptyPage.svelte';
	import { swipe } from 'svelte-gestures';
	import Page from '../../../lib/Page.svelte';
	import NavBar from '../../../lib/NavBar.svelte';
	import DotMenu from '../../../lib/DotMenu.svelte';

	const state: KGarooState = getState();
	let ids = state.listIds || [];
	const data = state.listData || {};
	$: cards = ids.map((id) => data[id]) as CheckList[];

	function onListRemove(list: CheckList): void {
		if (confirm(translate($locale, 'lists.remove-warning', { list: list.name }))) {
			ids = ids.filter((id) => id !== list.id);
			delete data[list.id];
			setState({
				...state,
				listIds: ids,
				listData: data
			});
		}
	}

	export function onCardClicked(id: string): void {
		goto(`/home/lists/${id}`);
	}

	export function onAddButtonClicked(): void {
		goto('/home/lists/create');
	}

	let isReloading = false;
	function onLocaleChange() {
		const state = getState();
		setState({ ...state, appSettings: { ...state.appSettings, lang: $locale } });
		isReloading = true;
		setTimeout(() => {
			isReloading = false;
		}, 300);
	}
</script>

<svelte:head>
	<title>K-garoo - {$t('app.my_lists')}</title>
</svelte:head>

{#if isReloading}
	<div class="flex h-full w-full justify-center items-center">
		<Spinner />
	</div>
{:else}
	<Page>
		<div slot="nav-bar">
			<NavBar on:locale-change={onLocaleChange} />
		</div>
		<div slot="top-bar" class="flex justify-end">
			<Button on:click={onAddButtonClicked} class="!p-2" o><Plus class="w-8 h-8" /></Button>
		</div>
		<div slot="body">
			<div class="flex items-start justify-center">
				{#if !cards?.length}
					<EmptyPage class="pt-6">
						{$t('lists.no_lists')}
						<br />
						{@html $t('lists.no_lists_cta_1')}
						<a class="underline cursor-pointer" href="/home/lists/create"
							>{$t('lists.no_lists_cta_link')}</a
						>
					</EmptyPage>
				{/if}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each cards as card}
						<div
							use:swipe={{ timeframe: 300, minSwipeDistance: 80, touchAction: 'pan-left pan-y' }}
							on:swipe={() => onListRemove(card)}
							on:click={() => onCardClicked(card.id)}
						>
							<Card
								class="!pl-6 !pt-6 !pb-6 !pr-10 hover:bg-gray-50 cursor-pointer w-70 sm:w-80 relative"
							>
								<div class="absolute top-1 right-1" onclick="event.stopPropagation()">
									<DotMenu>
										<DropdownItem>
											<div class="flex items-center" on:click={() => onListRemove(card)}>
												<Button class="!p-2 mr-2" color="light">
													<DocumentRemove size="15" />
												</Button>
												{$t('lists.remove-list')}
											</div>
										</DropdownItem>
									</DotMenu>
								</div>
								<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">
									{card.name}
								</h5>
								<div class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
									<ul>
										{#if card?.items?.length}
											<div>
												<li class="mb-1 {card.items[0]?.checked ? 'checked' : ''}">
													{card.items[0].itemDescription}
												</li>
											</div>
										{/if}
										{#if card?.items?.length > 1}
											<li class={card.items[1]?.checked ? 'checked' : ''}>
												{card.items[1].itemDescription}
											</li>
										{/if}
									</ul>
								</div>
							</Card>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</Page>
{/if}

<style>
	.list-details {
		flex: 1;
		cursor: pointer;
	}

	.checked {
		position: relative;
		display: inline-block;
		text-decoration: line-through;
	}
</style>
