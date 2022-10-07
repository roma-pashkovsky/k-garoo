import { FirebaseUtils } from './firebase-utils';

export class BaseDbPersistence {
	public isDbAvailable = false;
	public isLoggedIn = false;
	protected firebaseUtils = new FirebaseUtils();
	protected userId: string | null = null;
	private readonly firebaseSubId: string;
	private onDbAvailableChangeCb: ((isAvailable: boolean) => Promise<void>) | undefined;

	constructor() {
		this.firebaseSubId = this.firebaseUtils.subscribeOnAuthChanged((user) => {
			this.userId = user?.uid || null;
			this.isDbAvailable = !(user === undefined);
			this.isLoggedIn = !!user;
			if (this.onDbAvailableChangeCb) {
				this.onDbAvailableChangeCb(this.isDbAvailable);
			}
		});
	}

	public onDbAvailableChange(cb: (isAvailable: boolean) => Promise<void>): void {
		this.onDbAvailableChangeCb = cb;
	}

	public destroy(): void {
		this.firebaseUtils.unsubscribeOnAuthChanged(this.firebaseSubId);
	}
}
