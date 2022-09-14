import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export type ToastColor = 'default' | 'warning' | 'success';
export type ToastType = 'page-bottom' | 'details-top';
const DEAFULT_DURATION = 3000;

export type ToastManagerType = {
	toasts: Writable<Toast[]>;
	push: ({
		text,
		color,
		type,
		duration,
		closePrevious
	}: {
		text: string;
		color?: ToastColor;
		type?: ToastType;
		duration?: number;
		closePrevious: boolean;
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
		duration = DEAFULT_DURATION,
		closePrevious = false
	}: {
		text: string;
		color: ToastColor;
		type: ToastType;
		duration: number;
		closePrevious?: boolean;
	}): void {
		if (closePrevious) {
			this.toasts.set([{ text, color, type, showUntilUTC: new Date().getTime() + duration }]);
		} else {
			this.toasts.update((prev) => {
				const updated: Toast[] = [
					...prev,
					{ text, color, type, showUntilUTC: new Date().getTime() + duration }
				];
				return updated;
			});
		}
		this.setJobInterval();
	}

	public clear(): void {
		this.toasts.set([]);
		if (this.intervalHandle) {
			clearInterval(this.intervalHandle);
			this.intervalHandle = undefined;
		}
	}

	private setJobInterval(): void {
		if (!this.intervalHandle) {
			this.intervalHandle = setInterval(() => {
				const now = new Date().getTime();
				this.toasts.update((items) => {
					const updated = items.filter((it) => it.showUntilUTC > now);
					if (updated.length === 0) {
						clearInterval(this.intervalHandle);
						this.intervalHandle = undefined;
					}
					return updated;
				});
			}, 300);
		}
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
	closePrevious?: boolean;
}
