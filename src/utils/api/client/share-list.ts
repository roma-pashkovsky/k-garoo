export type ShareListRequest = {
	listId: string;
	userId: string;
};

export type CreateShareListInviteTokenRequest = {
	listId: string;
	token: string;
};

export type CreateShareListInviteTokenResponse = {
	token: string;
};
