<script lang="ts">
	export let value: string;
</script>

<input
	class="single-line w-full form-input block !border-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none focus:bg-blue-100 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 p-2.5 text-sm"
	id="form-input"
	autocomplete="off"
	autofocus
	inputmode="text"
	bind:value
	on:submit
	on:input
	on:blur
/>
