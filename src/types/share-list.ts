import type { AppUser } from './auth';
import type { CheckList } from './index';

export type ShareListUser = AppUser & { isShared: boolean };

export type SharedList = CheckList & { sharedBy: AppUser };
