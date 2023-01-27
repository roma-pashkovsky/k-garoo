<script lang="ts">
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { derived, writable } from 'svelte/store';
	import type { Unsubscriber } from 'svelte/store';
	import { parseListFromText } from '../../../utils/parse-list-from-text';
	import Page from '../../../lib/Page.svelte';
	import { Heading, Textarea } from 'flowbite-svelte';
	import ChecklistItemMove from '../../../lib/checklist-details/ChecklistItemMove.svelte';
	import { initAllListSearchOptions } from '../../../stores/checklist-details/move-checklist-items';
	import { isEnter } from '../../../utils/keycodes';
	import { auth } from '../../../stores/login/auth';
	import { t } from '../../../stores/app/translate.js';

	let url: string;
	let title: string;
	let text: string;
	const bullet = '\u2022';

	const sourceString = writable<string>(null);
	const parsedItemsToAdd = derived(sourceString, (sourceString$) => {
		return parseListFromText(sourceString$);
	});
	let unsub: Unsubscriber;

	onMount(() => {
		url = $page.url.searchParams.get('url');
		title = $page.url.searchParams.get('title');
		text = $page.url.searchParams.get('text');

		sourceString.set(textToSourceString(text));
		initAllListSearchOptions();
		unsub = auth.subscribe((a) => {
			if (a.user) {
				initAllListSearchOptions();
			}
		});
	});

	onDestroy(() => {
		if (unsub) {
			unsub();
		}
	});

	function textToSourceString(s: string): string {
		const initialParse = parseListFromText(s);
		let t = ``;
		const l = initialParse.length - 1;
		initialParse.forEach((it, ind) => {
			t += `${bullet} ${it.itemDescription}${ind == l ? '' : '\n'}`;
		});
		return t;
	}

	function onTextAreaKeyUp(event: any): void {
		if (isEnter(event)) {
			const val = event.target.value;
			sourceString.set(`${val}${bullet} `);
		}
	}
</script>

<Page>
	<Heading tag="h4" class="mb-4">{$t('share-target.title')}</Heading>
	<Textarea class="mb-4" bind:value={$sourceString} rows={4} on:keyup={onTextAreaKeyUp} />
	<ChecklistItemMove items={$parsedItemsToAdd} />
</Page>
