import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { Obligation, ObligationUpdatePayload, ApiResponse } from '../../../types';

export const obligationsApi = {
  listByDocumentId: async (docId: string): Promise<Obligation[]> => {
    const response = await client.get<ApiResponse<Obligation[]>>(ENDPOINTS.OBLIGATIONS.LIST(docId));
    return response.data.data;
  },

  update: async (id: string, payload: ObligationUpdatePayload): Promise<Obligation> => {
    const response = await client.patch<ApiResponse<Obligation>>(
      ENDPOINTS.OBLIGATIONS.UPDATE(id),
      payload
    );
    return response.data.data;
  },
};
