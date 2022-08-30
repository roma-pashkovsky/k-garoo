<script lang="ts">
	import { ArrowLeft, DotsHorizontal } from 'svelte-heros';
	import { navigateBack } from '../../../../utils/navigate-back';
	import { swipe } from 'svelte-gestures';

	export let isShowPropositions = false;
	export let listName = 'New list';
	export let isEditListName = false;
	export function onEditListNameOpen(): void {
		isEditListName = true;
	}
	export function onEditListNameSubmit(): void {
		isEditListName = false;
	}
	export let categoryOptions = [
		{
			name: 'Fruit'
		},
		{
			name: 'Dessert'
		},
		{
			name: 'Food'
		},
		{
			name: 'Other'
		},
		{
			name: 'Fish'
		},
		{
			name: 'Clothing'
		},
		{
			name: 'Chemistry'
		},
		{
			name: 'Custom'
		}
	];
	export let propositions = [
		{
			itemDescription: 'Shrimps',
			category: 'Fish'
		},
		{
			itemDescription: 'Boots',
			category: 'Clothing'
		},
		{
			itemDescription: 'Washing liquid',
			category: 'Chemistry'
		},
		{
			itemDescription: 'Apples',
			category: 'Fruit'
		}
	];
	export let items = [
		{
			id: 1,
			itemDescription: 'Bananas',
			isEdited: false,
			category: 'Fruit'
		},
		{
			id: 2,
			itemDescription: 'Candies',
			isEdited: false,
			category: 'Dessert'
		},
		{
			id: 3,
			itemDescription: 'Oil',
			isEdited: false,
			category: 'Food'
		}
	];

	$: filteredPropositions = propositions.filter((prop) => {
		return !items.some(
			(item) => item.itemDescription === prop.itemDescription && item.category === prop.category
		);
	});

	export let customInputCategory = '';

	export function submitCustomCategory(id: string): void {
		const item = items.find((s) => s.id === id);
		item.category = customInputCategory;
		item.isEdited = false;
		if (!categoryOptions.some((c) => c.name === customInputCategory)) {
			categoryOptions.push({ name: customInputCategory });
		}
		customInputCategory = '';
		items = items.map((s) => ({ ...s }));
		categoryOptions = categoryOptions.map((c) => ({ ...c }));
	}

	export function onBackClicked(): void {
		navigateBack();
	}

	export function onShowPropositionsClicked(): void {
		isShowPropositions = true;
	}

	export function onShowPropositionsCloseClicked(): void {
		isShowPropositions = false;
	}

	export function onAddPropositionClicked(prop): void {
		items.push({
			id: new Date().getTime(),
			itemDescription: prop.itemDescription,
			category: prop.category,
			isEdited: false
		});
		items = items.map((s) => ({ ...s }));
	}

	export function onItemClick(id: string): void {
		items = items
			.map((source) => {
				return { ...source, isEdited: id === source.id ? !source.isEdited : false };
			})
			.filter((item) => item.isEdited || item.itemDescription?.length > 0);
	}

	export function onItemSwipe(id: string, event): void {
		console.log(event);
		if (event.detail.direction === 'left') {
			items = items.filter((item) => item.id !== id);
		}
	}

	export function onInsertBeforeListClick(): void {
		items = items.map((s) => ({ ...s, isEdited: false }));
		const newId = new Date().getTime();
		items.unshift({
			id: newId,
			itemDescription: '',
			category: 'Other',
			isEdited: true
		});
		items = items
			.map((s) => ({ ...s, isEdited: s.id === newId }))
			.filter((item) => item.isEdited || item.itemDescription?.length > 0);
	}

	export function onItemInsertAfterClick(id: number): void {
		items = items.map((s) => ({ ...s, isEdited: false }));
		const index = items.findIndex((item) => item.id === id);
		const newId = new Date().getTime();
		items.splice(index + 1, 0, {
			id: newId,
			itemDescription: '',
			category: 'Other',
			isEdited: true
		});
		items = items
			.map((s) => ({ ...s, isEdited: s.id === newId }))
			.filter((item) => item.isEdited || item.itemDescription?.length > 0);
	}

	export function handleInputSubmit(id: string): void {
		const index = items.findIndex((item) => item.id === id);
		if (items[index].category === 'Custom') {
			submitCustomCategory(id);
		}
		if (index === items.length - 1) {
			const newId = new Date().getTime();
			items.push({
				id: newId,
				itemDescription: '',
				category: 'Other',
				isEdited: true
			});
			items = items.map((s) => ({ ...s, isEdited: s.id === newId }));
		} else {
			items = items.map((s) => ({ ...s, isEdited: false }));
		}
	}

	export function handleInputBlur(id: string): void {
		const itemIndex = items.findIndex((item) => item.id === id);
		if (items[itemIndex].category === 'Custom') {
			submitCustomCategory(id);
		}
		const item = items[itemIndex];
		if (item?.itemDescription?.length < 1) {
			items = items.filter((s) => s.id !== id);
		}
	}

	export function onCloseAllEdits(): void {
		items = items
			.map((s) => ({ ...s, isEdited: false }))
			.filter((s) => s.itemDescription.length > 0);
	}
</script>

<section on:click={onEditListNameSubmit} class="section-container h-screen w-screen flex flex-col">
	<div
		class="flex justify-between items-center"
		style="padding-left: 2rem; padding-right: 2rem; padding-top: 1rem;"
	>
		<div class="flex items-center" style="height: 25px">
			<ArrowLeft on:click={onBackClicked} class="w-25 h-25" />
		</div>
		<div class="flex items-center left" style="height: 25px">
			{#if isEditListName}
				<form on:submit|preventDefault={onEditListNameSubmit}>
					<input id="list-name" autofocus type="text" bind:value={listName} />
				</form>
			{:else}
				<h3 on:click|stopPropagation={onEditListNameOpen} class="font-medium text-2xl">
					{listName}
				</h3>
			{/if}
		</div>
		<div class="flex items-center right">
			<button on:click={onShowPropositionsClicked} style="width: 25px; height: 25px;">
				<DotsHorizontal class="w-25 h-25" />
			</button>
		</div>
	</div>
	{#if isShowPropositions}
		<div class="fixed left-0 top-0 bottom-0 right-0 z-50 text-base">
			<div
				on:click={onShowPropositionsCloseClicked}
				class="absolute left-0 top-0 bottom-0 right-0 z-40 bg-black opacity-50"
				style="background-color: black"
			/>
			<div class="propositions-pane absolute top-0 bottom-0 right-0 bg-white w-80 z-50 p-0.5">
				{#each filteredPropositions as prop}
					<div
						on:click={() => onAddPropositionClicked(prop)}
						class="px-2 py-3 flex justify-between"
					>
						<div>
							{prop.itemDescription}
						</div>
						<div class="text-sm text-gray-600">
							{prop.category}
						</div>
					</div>
				{/each}
				<div />
			</div>
		</div>
	{/if}
	<div class="scroll-auto flex-1 p-8" on:click={onCloseAllEdits}>
		<div
			on:click|stopPropagation={onInsertBeforeListClick}
			class="insert-before-button"
			style="height: 20px"
		/>
		{#each items as item}
			<div
				use:swipe={{ timeframe: 300, minSwipeDistance: 100, touchAction: 'pan-left pan-y' }}
				on:click|stopPropagation={() => onItemClick(item.id)}
				on:swipe={() => onItemSwipe(item.id, event)}
				class="flex justify-between"
			>
				<div class="left space-x-2 flex-1 flex items-center" style="height: 42px">
					{#if item.isEdited}
						<form on:submit|preventDefault={() => handleInputSubmit(item.id)}>
							<input
								autofocus
								on:blur={() => handleInputBlur(item.id)}
								type="text"
								bind:value={item.itemDescription}
							/>
						</form>
					{:else}
						{item.itemDescription}
					{/if}
				</div>
				<div class="right flex flex-col ml-2 text-sm text-gray-600">
					{#if item.isEdited}
						<select
							style="height: 42px;"
							onclick="event.stopPropagation()"
							bind:value={item.category}
						>
							{#each categoryOptions as cOption}
								<option value={cOption.name}>{cOption.name}</option>
							{/each}
						</select>
						{#if item.category === 'Custom'}
							<form
								id="custom-category-form"
								class="mt-2"
								on:submit|preventDefault={() => submitCustomCategory(item.id)}
							>
								<input
									style="height: 42px; display: block; width: 100%;"
									onclick="event.stopPropagation()"
									type="text"
									id="custom-category-input"
									bind:value={customInputCategory}
									placeholder="My category"
								/>
							</form>
						{/if}
					{:else}
						<div class="flex justify-end items-center" style="height: 42px;">
							{item.category}
						</div>
					{/if}
				</div>
			</div>
			<div
				on:click|stopPropagation={() => onItemInsertAfterClick(item.id)}
				class="insert-after-button"
				style="height: 20px"
			/>
		{/each}
	</div>
</section>

<style>
</style>
