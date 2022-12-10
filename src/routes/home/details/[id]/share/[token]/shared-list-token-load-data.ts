import type { AppUser } from '../../../../../../types/auth';

export type VerifiedToken = {
	user?: AppUser;
	verified: boolean;
	value: string;
};

export type SharedListTokenLoadData = { token: VerifiedToken };
