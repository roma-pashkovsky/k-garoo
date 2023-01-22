<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { AppSettingsStore } from '../../../stores/app/app-settings';
	import GooglePlayLinkButton from '../../../lib/GooglePlayLinkButton.svelte';
	import { fade } from 'svelte/transition';

	let innerScrollDiv: HTMLDivElement;
	let scrollDivHeight: number;
	let isAnimating = false;
	let isInit = false;
	const scrollBreak = 350;

	async function onScrollDiv(): Promise<void> {
		if (isAnimating) {
			return;
		}
		isAnimating = true;
		try {
			await doOnScroll();
		} catch (err) {
			console.log('anim error: ', err);
		} finally {
			isAnimating = false;
		}
	}

	let scrollValue;
	async function doOnScroll(): Promise<void> {
		return new Promise((resolve) => {
			window.requestAnimationFrame(() => {
				scrollValue = innerScrollDiv.scrollTop;
				if (scrollValue < 400) {
					const scrollPercent = scrollValue / scrollDivHeight;
					let scrollInd = 1 - scrollPercent;
					scrollInd = Math.max(0.75, scrollInd);
					scrollInd = Math.min(1, scrollInd);
					innerScrollDiv.style.setProperty('--scroll-ind', '' + scrollInd);
					innerScrollDiv.style.setProperty('--scroll-percent', '' + scrollPercent);
				}
				resolve();
			});
		});
	}

	onMount(() => {
		AppSettingsStore.setLanguage('ua');
		scrollDivHeight = innerScrollDiv.getBoundingClientRect().height;
		innerScrollDiv.addEventListener('scroll', onScrollDiv);
		setTimeout(() => (isInit = true), 200);
	});

	onDestroy(() => {
		if (innerScrollDiv) {
			innerScrollDiv.removeEventListener('scroll', onScrollDiv);
		}
	});
</script>

<svelte:head>
	<title>Garoo - Зручні списки</title>
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://garoo.fun/welcome/ua" />
	<meta property="og:site_name" content="Garoo" />
	<meta
		property="og:description"
		content="Прості списки - в магазин, на роботу чи для особистих проектів"
	/>
	<meta property="og:title" content="Garoo - Застосунок для списків" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:description"
		content="Прості списки - в магазин, на роботу чи для особистих проектів"
	/>
	<meta name="twitter:site" content="@business" />
	<meta name="twitter:title" content="Garoo - Застосунок для списків" />
	<meta property="og:image" content="https://www.garoo.fun/landing/thumb-ua.png" />
	<meta property="og:image:secure_url" content="https://www.garoo.fun/landing/thumb-ua.png" />
	<meta property="og:image:width" content="125" />
	<meta property="og:image:height" content="100" />
	<meta name="twitter:image" content="https://www.garoo.fun/landing/thumb-ua.png" />
</svelte:head>

<div class="welcome-page w-full h-full flex justify-center bg-gray-200">
	<div bind:this={innerScrollDiv} class="welcome-inner h-full w-full overflow-y-auto bg-white">
		<!--		Sticky top-->
		<div class="sticky z-10 top-0">
			<!--		Support Ukraine-->
			{#if isInit}
				<div
					in:slide|local={{ duration: 600 }}
					class="bg-blue-800 text-white flex justify-center space-x-2 py-1 sticky z-10"
				>
					<a href="/home/support-ukraine" class="h-6">Garoo підтримує Україну!</a><img
						src="/flag-Ukraine.png"
						alt="support Ukraine"
						class="h-6"
					/>
				</div>
			{/if}
			<!--		Top bar-->
			<div
				class="top-bar crisp-blue-bg standard-pad-right standard-pad-left flex justify-between items-center"
			>
				<div class="flex items-center space-x-2">
					{#if scrollValue > scrollBreak}
						<img in:fade|local src="/garoo-logo-white.svg" class="h-[32px] md:h-[40px] mr-2" />
						<div class="hidden md:block top-bar-label">Garoo</div>
					{/if}
				</div>
				<div class="flex justify-end items-center space-x-2">
					{#if scrollValue > scrollBreak}
						<a
							in:fade|local
							class="font-sb pad-btn bg-white flex items-center justify-center text-black rounded-md whitespace-nowrap h-[38px] md:h-[49px] relative w-[120px] md:w-[180px] text-sm"
							href="/home/lists"
						>
							Веб-застосунок
						</a>
						<div in:fade|local class="hidden md:block">
							<GooglePlayLinkButton lang="ua" height={52} />
						</div>
						<div in:fade|local class="md:hidden">
							<GooglePlayLinkButton lang="ua" height={41} />
						</div>
					{:else}
						<a
							class="top-bar-button change-lang font-regular height-btn pad-btn flex justify-center items-center text-white"
							href="/welcome/en">EN</a
						>
					{/if}
				</div>
			</div>
			<!--		EOF Top bar-->
		</div>

		<!--		Jumbo-->
		<div
			class="jumbo standard-pad-right standard-pad-left crisp-blue-bg flex flex-col items-center space-y-9 text-white"
		>
			<!--			Caption-->
			<div class="jumbo-caption flex flex-col items-center space-y-9">
				<div class="jumbo-text font-bold">Garoo - зручні списки</div>
				<div class="jumbo-subtext font-medium text-center pb-2">
					Списки повинні бути простими. Спробуйте наш безкоштовний застосунок, де можна складати і
					ділитися списками - в магазин, на роботу чи для особистих проектів.
				</div>
				<div
					class="pb-2 flex flex-col space-y-4 items-center md:flex-row md:space-x-4 md:space-y-0"
				>
					<a
						class="font-sb text-lg pad-btn bg-white flex items-center justify-center text-black rounded-md whitespace-nowrap h-[64px] w-[228px] text-sm"
						href="/home/lists"
					>
						Веб-застосунок
					</a>
					<GooglePlayLinkButton lang="ua" height="70" />
				</div>
			</div>
			<!--			EOF Caption-->
			<!--			Devices-->
			<div class="jumbo-devices-container relative hidden md:block">
				<div class="absolute w-full flex items-center justify-center" style="bottom: -470px">
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
		<!--		Feature highlights-->
		<div class="feature-highlights standard-pad-left standard-pad-right">
			<!--			First highlight-->
			<div
				class="highlight grid grid-cols-1 grid-rows-2 gap-y-8 md:grid-cols-2 md:grid-rows-1 md:gap-x-4"
			>
				<div class="flex justify-center">
					<div class="device-box">
						<img src="/landing/feature-device-1.png" class="feature-device-caption" width="220" />
						<div class="feature-device-backdrop blue-bg" />
					</div>
				</div>
				<div class="feature-box">
					<div class="feature-item">
						<div class="feature-bullet crisp-blue-bg" />
						<div class="feature-text">
							<div class="title font-md font-black">Автозаповнення</div>
							<div class="text font-regular font-gray">
								Garoo підказуватиме пункти, поки Ви набираєте текст, підлаштовуючись під те, що Ви
								вводили раніше.
							</div>
						</div>
					</div>
					<div class="feature-item">
						<div class="feature-bullet crisp-blue-bg" />
						<div class="feature-text">
							<div class="title font-md font-black">Гнучкі категорії</div>
							<div class="text font-regular font-gray">
								Можна переглядати пункти за категоріями, змінювати їх назви та колір.
							</div>
						</div>
					</div>
					<div class="feature-item">
						<div class="feature-bullet crisp-blue-bg" />
						<div class="feature-text">
							<div class="title font-md font-black">Підтримка жестів</div>
							<div class="text font-regular font-gray">
								Видаляйте, додавайте і редагуйте пункти одним свайпом.
							</div>
						</div>
					</div>
				</div>
			</div>
			<!--			Second highlight-->
			<div
				class="highlight grid grid-cols-1 grid-rows-2 gap-y-8 md:grid-cols-2 md:grid-rows-1 md:gap-x-8"
			>
				<div class="feature-box order-2 md:order-1">
					<div class="feature-item">
						<div class="feature-bullet crisp-blue-bg" />
						<div class="feature-text">
							<div class="title font-md font-black">Калькулятор</div>
							<div class="text font-regular font-gray">
								Garoo може обчислювати суми за пунктами з числами, наприклад тунець 60 грн.
							</div>
						</div>
					</div>
					<div class="feature-item">
						<div class="feature-bullet crisp-blue-bg" />
						<div class="feature-text">
							<div class="title font-md font-black">Темна тема</div>
							<div class="text font-regular font-gray">Щоб Ваші очі могли відпочити</div>
						</div>
					</div>
					<div class="feature-item">
						<div class="feature-bullet crisp-blue-bg" />
						<div class="feature-text">
							<div class="title font-md font-black">Без реклами</div>
							<div class="text font-regular font-gray">Простий інтерфейс без реклами.</div>
						</div>
					</div>
				</div>
				<div class="flex justify-center order-1 md:order-2">
					<div class="device-box">
						<img src="/landing/feature-device-2.png" class="feature-device-caption" width="220" />
						<div class="feature-device-backdrop blue-border" />
					</div>
				</div>
			</div>
			<!--			Third highlight-->
			<div
				class="highlight grid grid-cols-1 grid-rows-2 gap-y-8 md:grid-cols-2 md:grid-rows-1 md:gap-x-4"
			>
				<div class="flex justify-center">
					<div class="device-box">
						<img src="/landing/feature-device-3.png" class="feature-device-caption" width="220" />
						<div class="feature-device-backdrop blue-bg" />
					</div>
				</div>

				<div class="feature-box">
					<div class="feature-item">
						<div class="feature-bullet crisp-blue-bg" />
						<div class="feature-text">
							<div class="title font-md font-black">Діліться списками</div>
							<div class="text font-regular font-gray">
								Можна ділитися посиланнями на списки без реєстрації. Для зареєстрованих користувачів
								все навіть простіше - можна робити це прямо в застосункові.
							</div>
						</div>
					</div>
					<div class="feature-item">
						<div class="feature-bullet crisp-blue-bg" />
						<div class="feature-text">
							<div class="title font-md font-black">Навіть, коли нема інтернету...</div>
							<div class="text font-regular font-gray">
								У більшості випадків списками можна користуватись, коли немає інтернет-підключення.
								Зміни буде збережено, коли Ви будете знову онлайн.
							</div>
						</div>
					</div>
					<div class="feature-item">
						<div class="feature-bullet crisp-blue-bg" />
						<div class="feature-text">
							<div class="title font-md font-black">Працюємо на всіх платформах</div>
							<div class="text font-regular font-gray">
								У нас є затосунок під Андроїд. Крім того, наш сайт можна додати на головний екран
								телефону, щоб швидко заходити і користуватись ним як мобільним застуосунком. <a
									class="text-blue-600"
									href="/home/add-app-to-main-screen">Як додати на головний екран.</a
								>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!--		EOF Feature highlights-->
		<!--		Footer-->
		<div
			class="footer crisp-blue-bg standard-pad-bottom standard-pad-right standard-pad-left standard-pad-top font-regular text-sm"
		>
			Copyright (c) 2023. Розробили <a href="mailto:pashkovsky.roma@gmail.com"
				>Анна і Роман Пашковські</a
			>.
		</div>
		<!--		EOF Footer-->
	</div>
	<!--	EOF inner box-->
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

	/** Mobile */
	@media (max-width: 768px) {
		.top-bar-label {
			font-size: 20%;
		}

		.feature-highlights {
			padding-top: 0px;
			background: url('/landing/bg-donuts-top.svg') top -10px left 0/100% auto no-repeat,
				url('/landing/bg-donuts-line.svg') top 900px left 0/100% auto no-repeat,
				url('/landing/bg-donuts-line.svg') top 1800px left 0/100% auto no-repeat;
		}

		.feature-box {
			justify-content: flex-start;
		}

		.highlight {
			margin-top: 50px;
		}

		.jumbo {
			font-size: 62px;
		}

		.top-bar {
			font-size: 80px;
		}

		.pad-btn {
			padding: 0 15px;
		}

		.standard-pad-right {
			padding-right: 1rem;
		}

		.standard-pad-left {
			padding-left: 1rem;
		}

		.height-btn {
			height: calc(50px * var(--scroll-ind));
		}

		.device-box {
			height: 435px;
			width: 300px;
		}
	}

	/** Desktop */
	@media (min-width: 768px) {
		.top-bar-label {
			font-size: 30%;
		}

		.feature-highlights {
			padding-top: 300px;
			background: url('/landing/bg-donuts-top.svg') top 100px left 0/100% auto no-repeat,
				url('/landing/bg-donuts.svg') top 900px left 0/100% auto no-repeat;
		}

		.feature-box {
			justify-content: center;
		}

		.highlight {
			margin-top: 200px;
		}

		.jumbo {
			font-size: 96px;
		}

		.top-bar {
			font-size: 96px;
		}

		.pad-btn {
			padding: 0 42px;
		}

		.standard-pad-right {
			padding-right: 2rem;
		}

		.standard-pad-left {
			padding-left: 2rem;
		}

		.height-btn {
			height: calc(65px * var(--scroll-ind));
		}

		.device-box {
			height: 435px;
			width: 420px;
		}
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

	.font-bold {
		font-weight: 600;
	}

	.font-black {
		color: black;
	}

	.font-gray {
		color: rgba(0, 0, 0, 0.75);
	}

	.welcome-page {
		font-family: Inter;
		font-weight: 400;
		--crisp-blue: #1c64f2;
		--light-blue: #c6d7fa;
		--scroll-ind: 1;
		--scroll-percent: 0;
	}

	.welcome-inner {
		max-width: 1460px;
	}

	.top-bar {
		padding-top: calc(4rem * var(--scroll-ind) * 0.5);
		padding-bottom: calc(4rem * var(--scroll-ind) * 0.5);
		-webkit-box-shadow: 0px 2px 5px -2px rgba(0, 0, 0, var(--scroll-percent));
		box-shadow: 0px 2px 5px -2px rgba(0, 0, 0, var(--scroll-percent));
	}

	.top-bar-label {
		opacity: calc(var(--scroll-percent) * 4);
		color: white;
	}

	.top-bar-button {
		font-size: 16%;
	}

	.top-bar-button.change-lang {
		border: 1px solid white;
		border-radius: 4px;
	}

	.jumbo {
		height: 75vh;
		min-height: 570px;
	}

	.jumbo-caption {
		max-width: 1100px;
	}

	.jumbo-text {
		font-weight: 600;
		font-size: 90%;
	}

	.jumbo-subtext {
		max-width: 700px;
		font-size: 22%;
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
		margin: 0 110px;
	}

	.device-3 {
		width: 180px;
		height: 366px;
	}

	.crisp-blue-bg {
		background-color: var(--crisp-blue);
	}

	.standard-pad-top {
		padding-top: 2rem;
	}

	.standard-pad-bottom {
		padding-bottom: 2rem;
	}

	/** Feature highlights */
	.feature-highlights {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: 60px;
	}

	.device-box {
		position: relative;
	}

	.feature-device-caption {
		position: absolute;
		bottom: 0;
		left: 18%;
		z-index: 1;
		width: 64%;
	}

	.feature-device-backdrop {
		width: 100%;
		height: 50%;
		border-radius: 10px;
		position: absolute;
		bottom: 52px;
	}

	.feature-device-backdrop.blue-bg {
		background-color: var(--light-blue);
	}

	.feature-device-backdrop.blue-border {
		border: 1px solid var(--crisp-blue);
	}

	.feature-box {
		position: relative;
		top: -10px;
		display: flex;
		flex-direction: column;
	}

	.feature-item {
		display: flex;
	}

	.feature-item:not(:last-child) {
		margin-bottom: 48px;
	}

	.feature-bullet {
		height: 37px;
		width: 37px;
		border-radius: 4px;
		margin-right: 17px;
		position: relative;
		bottom: -4px;
	}

	.title {
		font-size: 16px;
	}

	.text {
		font-size: 14px;
		max-width: 252px;
	}

	.footer {
		color: white;
		min-height: 120px;
	}
</style>
