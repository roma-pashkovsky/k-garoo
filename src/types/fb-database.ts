export type ListsSharedWithMe = {
	[listId: string]: {
		sharedById: string;
		updated_utc: number;
	};
};

export type StopListAgainstMe = {
	[userId: string]: string;
};

export type StopListByMe = {
	[userId: string]: {
		updated_utc: number;
	};
};

export type UsersBySharedList = {
	[userId: string]: string;
};

export type RecentUsers = {
	[userId: string]: {
		updated_utc: number;
	};
};

export type ListsByUser = {
	[listId: string]: {
		updated_ts: number;
	};
};
