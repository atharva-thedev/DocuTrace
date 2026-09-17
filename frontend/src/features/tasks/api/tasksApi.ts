import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { ActionTask, TaskCreatePayload, TaskUpdatePayload, TaskStatus, TaskPriority, ApiResponse } from '../../../types';

export interface ListTasksParams {
  status?: TaskStatus;
  priority?: TaskPriority;
}

export const tasksApi = {
  list: async (params?: ListTasksParams): Promise<ActionTask[]> => {
    const response = await client.get<ApiResponse<ActionTask[]>>(ENDPOINTS.TASKS.LIST, { params });
    return response.data.data;
  },

  create: async (payload: TaskCreatePayload): Promise<ActionTask> => {
    const response = await client.post<ApiResponse<ActionTask>>(ENDPOINTS.TASKS.CREATE, payload);
    return response.data.data;
  },

  update: async (id: string, payload: TaskUpdatePayload): Promise<ActionTask> => {
    const response = await client.patch<ApiResponse<ActionTask>>(ENDPOINTS.TASKS.UPDATE(id), payload);
    return response.data.data;
  },
};
