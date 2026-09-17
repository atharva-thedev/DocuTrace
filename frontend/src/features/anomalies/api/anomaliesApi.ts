import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { AnomalyRecord, AnomalyResolvePayload, ApiResponse } from '../../../types';

export const anomaliesApi = {
  listByDocumentId: async (docId: string): Promise<AnomalyRecord[]> => {
    const response = await client.get<ApiResponse<AnomalyRecord[]>>(ENDPOINTS.ANOMALIES.LIST(docId));
    return response.data.data;
  },

  resolve: async (anomalyId: string, payload: AnomalyResolvePayload): Promise<AnomalyRecord> => {
    const response = await client.post<ApiResponse<AnomalyRecord>>(
      ENDPOINTS.ANOMALIES.RESOLVE(anomalyId),
      payload
    );
    return response.data.data;
  },
};
