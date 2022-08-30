<script lang="ts">
    import { Input, Label, Button, A } from 'flowbite-svelte';
    import { goto } from '$app/navigation';

    export let isSignIn = true;

    $: submitBtnText = isSignIn ? 'Login' : 'Create';
    $: linkText = isSignIn ? 'Create account' : 'Login';

    function onLinkClicked(): void {
        isSignIn = !isSignIn;
    }

    function onSubmitClicked(): void {
        goto('/home/lists')
    }
</script>

<div class="fixed w-screen h-screen flex items-center justify-center">
    <div style="height: 390px; width: 340px" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
        <div class="mb-4">
            <Label for='email' class='block mb-2'>Email</Label>
            <Input id='email' type="email" placeholder="you@email.com" />
        </div>
        <div class="mb-6">
            <Label for='password' class='block mb-2'>Password</Label>
            <Input id='password' type="password" />
        </div>
        <div class="flex items-center justify-between">
            <div class="flex space-x-4 items-center">

                <Button on:click={onSubmitClicked} size="lg">
                    <div style="width: 100px;">
                        {submitBtnText}
                    </div>
                </Button>


                <div on:click={onLinkClicked}>
                    <A><span class="text-sm hover:underline">{linkText}</span></A>
                </div>
            </div>

        </div>
    </div>
</div>
