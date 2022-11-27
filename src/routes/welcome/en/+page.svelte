<div class="welcome-page w-full h-full flex justify-center">
	<div class="welcome-inner h-full w-full overflow-y-auto bg-white">
		<!--		Top bar-->
		<div
			class="crisp-blue-bg standard-pad-top standard-pad-right standard-pad-left standard-pad-bottom  flex justify-end items-center sticky z-10 top-0"
		>
			<a class="font-regular height-btn pad-btn flex justify-center items-center text-white"
				>Українською</a
			>
			<a
				class="font-sb height-btn pad-btn bg-white flex items-center justify-center text-black rounded-md"
				href="/home/lists">Go to the app</a
			>
		</div>
		<!--		EOF Top bar-->
		<!--		Jumbo-->
		<div
			class="jumbo standard-pad-right standard-pad-left crisp-blue-bg flex flex-col items-center space-y-9 text-white"
		>
			<!--			Caption-->
			<div class="jumbo-caption flex flex-col items-center space-y-9">
				<div class="jumbo-text font-bold">Garoo Checklists</div>
				<div class="jumbo-subtext font-medium text-center pb-2">
					Checklists should be fun and easy. Try our free app to create and share checklists for
					shopping, work or personal development
				</div>
			</div>
			<!--			EOF Caption-->
			<!--			Devices-->
			<div class="jumbo-devices-container relative">
				<div class="absolute w-full flex items-center justify-center top-0">
					<div class="device-1">
						<img src="/landing/caption-iphone-1.png" alt="device caption" width="180" />
					</div>
					<div class="device-2">
						<img src="/landing/caption-ipad.png" alt="device caption" width="400" height="558" />
					</div>
					<div class="device-3">
						<img src="/landing/caption-iphone-2.png" alt="device caption" width="180" />
					</div>
				</div>
			</div>
			<!--			EOF Devices-->
		</div>
		<!--		EOF Jumbo-->
	</div>
</div>

<style>
	@font-face {
		font-family: Inter;
		src: url(/fonts/Inter-Regular.ttf);
		font-weight: 300;
	}

	@font-face {
		font-family: Inter;
		src: url(/fonts/Inter-Medium.ttf);
		font-weight: 400;
	}

	@font-face {
		font-family: Inter;
		src: url(/fonts/Inter-SemiBold.ttf);
		font-weight: 500;
	}

	@font-face {
		font-family: Inter;
		src: url(/fonts/Inter-Bold.ttf);
		font-weight: 600;
	}

	.font-regular {
		font-weight: 300;
	}

	.font-md {
		font-weight: 400;
	}

	.font-sb {
		font-weight: 500;
	}

	.height-btn {
		height: 65px;
	}

	.pad-btn {
		padding: 0 42px;
	}

	.font-bold {
		font-weight: 600;
	}

	.welcome-page {
		font-family: Inter;
		font-weight: 400;
	}

	.welcome-inner {
		max-width: 1460px;
	}

	.jumbo {
		height: 70vh;
	}

	.jumbo-caption {
		max-width: 861px;
	}

	.jumbo-text {
		font-weight: 600;
		font-size: 96px;
	}

	.jumbo-subtext {
		max-width: 491px;
	}

	.jumbo-devices-container {
		width: 1015px;
	}

	.device-1 {
		width: 180px;
		height: 366px;
	}

	.device-2 {
		width: 400px;
		height: 470px;
		margin: 0 40px;
	}

	.device-3 {
		width: 180px;
		height: 366px;
	}

	.crisp-blue-bg {
		background-color: #1c64f2;
	}

	.standard-pad-top {
		padding-top: 2rem;
	}

	.standard-pad-right {
		padding-right: 2rem;
	}

	.standard-pad-left {
		padding-left: 2rem;
	}

	.standard-pad-bottom {
		padding-bottom: 2rem;
	}
</style>
