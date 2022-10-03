<script>
	import Page from '../../../lib/Page.svelte';
	import { A, Heading, P } from 'flowbite-svelte';
	import { locale } from '../../../utils/i18n';

	const l = locale;
</script>

<Page>
	<section>
		<div class="section mb-6">
			{#if $l === 'ua'}
				<Heading tag="h2" class="mb-4">Про нас</Heading>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					Привіт! Нас звуть Анна і Роман. Ми з України. Розробили цей веб-додаток, щоби можна було
					легко створювати списки для покупок і зручно працювати з ними на мобільних пристроях.
				</P>
				<P weight="light" color="text-gray-500 dark:text-gray-400">
					Раді бачити Вас тут! Будь-які відгуки і пропозиції надсилайте, будь ласка, на пошту <A
						href="mailto:pashkovsky.roma@gmail.com">pashkovsky.roma@gmail.com</A
					>
				</P>
			{/if}
			{#if $l === 'en'}
				<Heading tag="h2" class="mb-4">About us</Heading>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					Hey there from Ukraine! It's Anna and Roman. We've developed this web-app so that you can
					easily create and manage shopping lists, especially on your phone.
				</P>
				<P weight="light" color="text-gray-500 dark:text-gray-400">
					Great to see you here! Please email any feedback to <A
						href="mailto:pashkovsky.roma@gmail.com">pashkovsky.roma@gmail.com</A
					>.
				</P>
			{/if}
		</div>
		<div id="privacy" name="privacy" class="section">
			{#if $l === 'ua'}
				<Heading class="mb-4" tag="h4">Політика конфіденційності</Heading>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400"
					>Всі Ваші дані зберігаються локально, на Вашому пристрої, до моменту реєстрації.</P
				>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					Під час реєстрації ми отримуємо від провайдера (Facebook або Gmail) Ваше прізвище, імʼя та
					фото.
				</P>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					Після ресєстрації та входу в систему дані зберігаються на сервері <A
						href="https://firebase.google.com/">Firebase</A
					>. Це дозволяє Вам бачити свої списки на всіх пристроях. Ми не передаємо Ваші дані третім
					особам.
				</P>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					Налаштування сервера передбачають, що <strong
						>будь-хто, маючи посилання на Ваш список, може читати і змінювати його</strong
					>. Тож не варто включати в списки конфіденціну інформацію, і розміщувати посилання у
					відкритому доступі.
				</P>
			{/if}
			{#if $l === 'en'}
				<Heading class="mb-4" tag="h4">Privacy statement</Heading>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400"
					>Until you register all your data is stored locally on your device.</P
				>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					Upon signup we get your first and last name, and your photo from the authentication
					provider (Facebook or Gmail).
				</P>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					After you signup and login to the system your data is stored with <A
						href="https://firebase.google.com/">Firebase</A
					>. This way you can see your lists on all your devices. We don't share your data with any
					third parties.
				</P>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					Server settings are such that <strong
						>anyone having a link to your list can read and change it</strong
					>. So you shouldn't rely on the list to store your sensitive information. You also
					shouldn't publish the links to your lists for general public.
				</P>
			{/if}
		</div>
		<div id="tos" name="tos" class="section">
			{#if $l === 'ua'}
				<Heading class="mb-4" tag="h4">Умови використання</Heading>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					Сервіс надається безкоштовно.
				</P>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					Ми не несемо відповідальності за втрату Ваших даних або за некоректну роботу додатку. Ми
					працюємо над виправленням багів і покращенням роботи, але додаток досі перебуває на стадії
					активної розробки.
				</P>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					Умови обслуговування можуть змінитись, залежно від того як розвиватиметься сервіс.
				</P>
			{/if}
			{#if $l === 'en'}
				<Heading class="mb-4" tag="h4">Terms of Service</Heading>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					The service is free of charge.
				</P>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					We are not responsible for the loss of your data or incorrect operation of the app. While
					we are working to fix the bugs and improve the service, it's still under development and
					testing.
				</P>
				<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
					Terms of service might change, as the app evolves.
				</P>
			{/if}
		</div>
	</section>
</Page>
