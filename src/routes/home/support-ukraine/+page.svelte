<script lang="ts">
	import Page from '../../../lib/Page.svelte';
	import { Heading, Li, List, P } from 'flowbite-svelte';
	import { AppSettingsStore } from '../../../stores/app/app-settings';

	const l = AppSettingsStore.lang;
</script>

<Page>
	{#if $l === 'en'}
		<div class="mb-8">
			<Heading tag="h4" class="mb-4">Hey there...</Heading>
			<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
				As you know, there's war going on in Ukraine. K.Garoo believes that supporting Ukraine
				should be on every checklist.
			</P>
			<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">How can I support?</P>
			<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
				<List tag="ul" ulClass="text-gray-500 dark:text-gray-400 list-disc list-inside">
					<Li class="pb-3">
						<strong>Donate, if you can.</strong> Ukraine has many friends and their support is
						priceless. Who should I donate to? Some options are a sure way to bring value:
						<br />
						<List
							class="pl-5 mt-2 space-y-1"
							ulClass="text-gray-500 dark:text-gray-400 list-disc list-inside"
						>
							<Li>
								<strong
									><a
										class="underline"
										href="https://bank.gov.ua/en/news/all/natsionalniy-bank-vidkriv-spetsrahunok-dlya-zboru-koshtiv-na-potrebi-armiyi"
										>National Bank of Ukraine account for supporting the Army of Ukraine</a
									></strong
								>
							</Li>
							<Li>
								<strong
									><a
										class="underline"
										href="https://savelife.in.ua/en/donate-en/#donate-army-card-monthly"
										>Come Back Alive Fund</a
									></strong
								>
							</Li>
							<Li>
								<strong
									><a class="underline" href="https://prytulafoundation.org/en/home/support_page"
										>Serhiy Prytula Charity Fundation</a
									></strong
								>
							</Li>
						</List>
					</Li>
					<Li class="pb-3">
						<strong>Get a good word.</strong> Get yourself more educated on the Ukrainian and Russian
						relations, using a neutral source like Wiki. It will make you more immune to the Russian
						propaganda narratives, like some mysterious nazis or "bioweapon labs". If you believe that
						Russia was "provoked" to start the war by NATO, just know that it's a very Russian way of
						clearing itself from responsibility.
					</Li>
					<Li class="pb-3">
						<strong>Spread a good word.</strong> Russia relies heavily on corrupt media to give itself
						some kind of moral grounds. So every kind word you say to support Ukraine helps counterbalance
						their attempts.
					</Li>
					<Li class="pb-3">
						<strong>Stay calm.</strong> Your emotions are a primary target for any terrorist. Especially
						your fear is of interest. Is the nuclear threat real? Does Putin have anything else in his
						pocket? K.Garoo has no answers to these questions. The only thing he knows is that yielding
						to crazy dictators won't make the world a safer place.
					</Li>
				</List>
			</P>
			<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
				Remember there's no such thing as a too small contribution. There's a simple mathematical
				proof for that. A million times nothing is still nothing. A million times one cent is
				$10,000, which is quite something. Stay strong!
			</P>
		</div>
	{:else}
		<div class="mb-8">
			<Heading tag="h4" class="mb-4">Друже</Heading>
			<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
				Ти читаєш це українською, отже скоріше за все, знаєш, що в Україні війна. Тобі не потрібно
				говорити про необхідність підтримувати армію і ретельно добирати джерела, з яких отримуєш
				новини, аби не дати російській інформаційній гідрі отруїти твій мозок.
			</P>
			<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
				Можливо навіть, ще одна згадка про війну в застосункові для списків дратуватиме тебе.
			</P>
			<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
				Ти маєш право на будь-які емоції, зважаючи на ситуацію, в якій ми опинилися.
			</P>
			<P class="mb-3" weight="light" color="text-gray-500 dark:text-gray-400">
				Тут ми лише можемо побажати нам всім сили діяти, підтримувати наших близьких, наближати нашу
				перемогу і будувати Україну, якою ми пишатимемось. Наша перемога - безальтернативна. Слава
				Україні!
			</P>
		</div>
	{/if}
</Page>
