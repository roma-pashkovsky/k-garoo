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

export const appSettings = writable<AppSettings>({
	isLocaleSet: true,
	lang: 'en',
	theme: 'light',
	version: currentAppVersion
});

export const loadAppSettings = async (f = fetch): Promise<void> => {
	const settingsResp = await f('/api/v1/settings', { method: 'GET' });
	const settings = await settingsResp.json();
	if (settings) {
		appSettings.set(settings);
	}
};

export const updateAppSettingsEndpoint = async (settings: AppSettings): Promise<void> => {
	await fetch('/api/v1/settings', { method: 'POST', body: JSON.stringify(settings) });
};

export class AppSettingsStore {
	public static lang = derived(appSettings, (settings) => settings?.lang);
	public static theme = derived(appSettings, (settings) => settings?.theme);
	public static isLocaleSet = derived(appSettings, (settings) => settings?.isLocaleSet, true);
	public static appVersion = derived(appSettings, (settings) => settings?.version);

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
			appSettings.set(settings);
			setAppSettings(settings);
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
		appSettings.update((s) => {
			return { ...(s || getInitialState().appSettings), lang: l };
		});
		setAppSettings(get(appSettings) as AppSettings);
		await updateAppSettingsEndpoint(get(appSettings) as AppSettings);
	}

	public static async setTheme(t: Theme): Promise<void> {
		appSettings.update((s) => {
			return { ...(s || getInitialState().appSettings), theme: t };
		});
		setAppSettings(get(appSettings) as AppSettings);
		await updateAppSettingsEndpoint(get(appSettings) as AppSettings);
	}

	public static async markIsLocaleSet(): Promise<void> {
		appSettings.update((s) => {
			return { ...(s as AppSettings), isLocaleSet: true };
		});
		setAppSettings(get(appSettings) as AppSettings);
		await updateAppSettingsEndpoint(get(appSettings) as AppSettings);
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
