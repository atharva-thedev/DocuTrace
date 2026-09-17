import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { DashboardSummary, ApiResponse } from '../../../types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await client.get<ApiResponse<DashboardSummary>>(ENDPOINTS.DASHBOARD.SUMMARY);
    return response.data.data;
  },
};
