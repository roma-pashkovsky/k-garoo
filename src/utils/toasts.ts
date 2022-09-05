import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export type ToastColor = 'default';
export type ToastType = 'page-bottom' | 'details-top';
const DEAFULT_DURATION = 3000;

export type ToastManagerType = {
	toasts: Writable<Toast[]>;
	push: ({
		text,
		color,
		type,
		duration
	}: {
		text: string;
		color?: ToastColor;
		type?: ToastType;
		duration?: number;
	}) => void;
	clear: () => void;
};

class ToastManager {
	public toasts = writable<Toast[]>([]);
	private intervalHandle: any;

	public push({
		text,
		color = 'default',
		type = 'page-bottom',
		duration = DEAFULT_DURATION
	}: {
		text: string;
		color: ToastColor;
		type: ToastType;
		duration: number;
	}): void {
		this.toasts.update((prev) => {
			const l = prev.length;
			const updated: Toast[] = [
				...prev,
				{ text, color, type, showUntilUTC: new Date().getTime() + duration }
			];
			if (l === 0) {
				setTimeout(() => this.setJobInterval());
			}
			return updated;
		});
	}

	public clear(): void {
		this.toasts.set([]);
	}

	private setJobInterval(): void {
		this.intervalHandle = setInterval(() => {
			const now = new Date().getTime();
			this.toasts.update((items) => {
				const updated = items.filter((it) => it.showUntilUTC > now);
				if (!updated.length) clearInterval(this.intervalHandle);
				return updated;
			});
		}, 500);
	}
}

export class ToastService {
	private static _manager: ToastManager;
	public static getInstance(): ToastManagerType {
		if (!ToastService._manager) {
			ToastService._manager = new ToastManager();
		}
		return ToastService._manager as ToastManagerType;
	}
}

export interface Toast {
	text: string;
	color: ToastColor;
	type: ToastType;
	showUntilUTC: number;
}
