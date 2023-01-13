import type { CategoryOption, UserByListStatus } from './index';

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
		order: number;
	};
};

export type CategoryOptionsByUser = {
	[optionId: string]: CategoryOption;
};

export type UsersByList = {
	[userId: string]: {
		utc: number;
		status: UserByListStatus;
	};
};

export type ShareListInviteTokenData = {
	listId: string;
	userId: string;
	created_utc: number;
};
