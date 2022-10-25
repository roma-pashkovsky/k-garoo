<script lang="ts">
	import { Avatar } from 'flowbite-svelte';
	import type { AppUser } from '../types/auth';

	export let user: AppUser;
	export let size: 'xs' | 'md' = 'md';
</script>

<div class="flex items-center space-x-4  py-2">
	<Avatar {size} src={user?.photoUrl} alt="user image" class="flex-shrink-0" />
	<div class="flex-1 min-w-0">
		<p
			class="{size === 'xs'
				? 'text-xs'
				: 'text-sm'} font-medium text-gray-900 truncate dark:text-white"
		>
			{user?.displayName}
		</p>
	</div>
	<div>
		<slot />
	</div>
</div>
