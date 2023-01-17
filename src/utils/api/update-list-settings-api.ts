import type { UpdateChecklistSettingsRequest } from './client/checklist-settings';
import type { FirebaseSetItem } from '../../types/firebase-utils';
import type { ChecklistSettings } from '../../types';
import { readOnceAdmin, setAdmin } from './firebase-admin-utils';
import { listPropertyPath, listSettingsByMeByListPropertyPath } from './db-paths';

export const updateListSettingsApi = async (
	userId: string,
	listId: string,
	editRequest: UpdateChecklistSettingsRequest
): Promise<void> => {
	const createdBy = await readOnceAdmin<string>(listPropertyPath(listId, 'createdById'));
	const isCreatedByMe = userId === createdBy;
	if (editRequest) {
		const updated: FirebaseSetItem[] = [];
		for (const key in editRequest) {
			const value = (editRequest as any)[key];
			if (key === 'isGroupByCategory' && isCreatedByMe) {
				updated.push({
					path: listPropertyPath(listId, 'isGroupByCategory'),
					value
				});
			}
			if (key === 'isCalcMode' && isCreatedByMe) {
				updated.push({
					path: listPropertyPath(listId, 'isCalcMode'),
					value
				});
			}
			const path = listSettingsByMeByListPropertyPath(
				userId,
				listId,
				key as keyof ChecklistSettings
			);
			updated.push({ path, value });
		}
		await setAdmin(updated);
	}
};
