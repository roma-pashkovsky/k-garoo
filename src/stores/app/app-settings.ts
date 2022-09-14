import { writable } from 'svelte/store';
import type { AppSettings } from '../../types';

export const appSettingsStore = writable<AppSettings | null>(null);
