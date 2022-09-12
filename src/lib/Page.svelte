<div class="fixed top-0 bottom-0 left-0 right-0 flex flex-col">
	<div>
		<slot name="nav-bar" />
	</div>
	<div class="px-2 sm:px-4 py-4">
		<slot name="top-bar" />
	</div>
	<div class="flex-1 relative">
		<div class="absolute top-0 bottom-0 left-2 right-2 sm:left-4 sm:right-4 overflow-y-auto pb-6">
			<slot name="body" />
		</div>
	</div>
</div>
