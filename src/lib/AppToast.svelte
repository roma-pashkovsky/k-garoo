<script lang="ts">
	import type { Toast as ToastType } from '../utils/toasts';
	import { Toast } from 'flowbite-svelte';

	export let toast: ToastType;
</script>

<Toast simple={true} class="!bg-blue-200">{toast.text}</Toast>
