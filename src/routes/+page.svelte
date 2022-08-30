<script lang="ts">
    import {onMount} from "svelte";
    import { goto } from '$app/navigation';

    export let data;

    onMount(() => {
        if (data.isAuthed) {
            goto('/home/lists');
        } else {
            goto('/login');
        }
    });
</script>

<svelte:head>K-garoo easy checklists</svelte:head>
