<script lang="ts">
    import { Button } from 'flowbite-svelte'
    import {navigateBack} from "../../../../utils/navigate-back";

    export const onBackClicked = (): void => {
        navigateBack()
    }
</script>

<div>
    Card works <Button on:click={onBackClicked}>Back</Button>
</div>
