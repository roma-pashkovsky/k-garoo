export interface ApiSyncTask {
	// if a task with one group id fails, subsequent tasks with this group id will be skipped
	groupId: string;
	urlPath: string;
	body?: string;
	method: 'PUT' | 'POST' | 'GET' | 'DELETE';
	ts: number;
}
