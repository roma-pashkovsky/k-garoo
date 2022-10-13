<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import FullPageSpinner from '../../../lib/FullPageSpinner.svelte';
	import { StringCompressor } from '../../../utils/string-compressor';
	import type { CheckList } from '../../../types';
	import { DecodeStore } from '../../../stores/decode/decode.store';
	import { goto } from '$app/navigation';
	import { t } from '../../../stores/app/translate';

	const store = new DecodeStore();

	onMount(async () => {
		const compressor = new StringCompressor();
		const uri = $page.params.uri;
		if (!uri) {
			throw new Error('Bad uri');
		}
		const str = compressor.decompressFromEncodedURIComponent(uri);
		const parsed: CheckList = JSON.parse(str);
		if (parsed) {
			await store.process(parsed);
			goto(`/list-details/${parsed.id}`);
		} else {
			throw new Error('Unable to parse url');
		}
	});
</script>

<svelte:head>
	<title>K-garoo - {$t('lists.decode.page-title')}</title>
</svelte:head>

<FullPageSpinner />
