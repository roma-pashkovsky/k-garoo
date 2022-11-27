import type { ChecklistDetailsLoadData } from '../../checklist-details-load-data';
import type { AppUser } from '../../../../../../../types/auth';

export type VerifiedToken = {
	user?: AppUser;
	verified: boolean;
	value: string;
};

export type SharedListTokenLoadData = { token: VerifiedToken };
