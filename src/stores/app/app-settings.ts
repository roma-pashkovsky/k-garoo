import { derived, get, writable } from 'svelte/store';
import type { AppSettings, Language, Theme } from '../../types';
import {
	cleanAllLocalData,
	getAppSettings,
	getInitialState,
	setAppSettings
} from '../../utils/local-storage-state';
import translations from '../../utils/i18n-translations';

export const defaultLocale = 'en';
export const locales = Object.keys(translations);

const currentAppVersion = 1;

export class AppSettingsStore {
	private static appSettings = writable<AppSettings>(getInitialState().appSettings);
	public static lang = derived(AppSettingsStore.appSettings, (settings) => settings?.lang);
	public static theme = derived(AppSettingsStore.appSettings, (settings) => settings?.theme);
	public static isLocaleSet = derived(
		AppSettingsStore.appSettings,
		(settings) => settings?.isLocaleSet
	);
	public static appVersion = derived(AppSettingsStore.appSettings, (settings) => settings?.version);

	private static isInit = false;

	public static async init(): Promise<void> {
		if (!this.isInit) {
			let settings = getAppSettings();
			if (!settings) {
				settings = {
					...getInitialState().appSettings,
					lang: getLocaleFromBrowser(),
					version: currentAppVersion
				};
			} else if (settings.version !== currentAppVersion) {
				settings = await this.doForOldApp(settings);
			}
			this.appSettings.set(settings);
			setAppSettings(settings);
			console.log(get(this.appSettings));
			this.isInit = true;
		}
	}

	private static async doForOldApp(oldSettings: AppSettings): Promise<AppSettings> {
		if (
			confirm(
				'K-garoo was updated. Your lists should be cleaned for the app to work correctly. Continue?'
			)
		) {
			cleanAllLocalData();
			return {
				...getInitialState().appSettings,
				lang: getLocaleFromBrowser(),
				version: currentAppVersion
			};
		} else {
			return oldSettings;
		}
	}

	public static async setLanguage(l: Language): Promise<void> {
		this.appSettings.update((s) => {
			return { ...(s || getInitialState().appSettings), lang: l };
		});
		setAppSettings(get(this.appSettings) as AppSettings);
	}

	public static async setTheme(t: Theme): Promise<void> {
		this.appSettings.update((s) => {
			return { ...(s || getInitialState().appSettings), theme: t };
		});
		setAppSettings(get(this.appSettings) as AppSettings);
	}

	public static async markIsLocaleSet(): Promise<void> {
		this.appSettings.update((s) => {
			return { ...(s as AppSettings), isLocaleSet: true };
		});
		setAppSettings(get(this.appSettings) as AppSettings);
	}
}

function getLocaleFromBrowser(): Language {
	const browserLanguages = navigator.languages;
	for (let i = 0; i < browserLanguages.length; i++) {
		const l = browserLanguages[i].split('-')[0];
		if (translations[l]) {
			return l as Language;
		}
	}
	return defaultLocale;
}
