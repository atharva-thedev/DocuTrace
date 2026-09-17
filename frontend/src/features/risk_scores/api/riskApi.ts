import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { RiskScore, ApiResponse } from '../../../types';

export const riskApi = {
  getByDocumentId: async (docId: string): Promise<RiskScore> => {
    const response = await client.get<ApiResponse<RiskScore>>(ENDPOINTS.RISK_SCORES.DETAIL(docId));
    return response.data.data;
  },
};
