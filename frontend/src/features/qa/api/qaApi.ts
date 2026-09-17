import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { QAPromptPayload, QAMessage, QAThread, ApiResponse } from '../../../types';

export const qaApi = {
  query: async (payload: QAPromptPayload): Promise<QAMessage> => {
    const response = await client.post<ApiResponse<QAMessage>>(ENDPOINTS.QA.QUERY, payload);
    return response.data.data;
  },

  listThreads: async (documentId?: string): Promise<QAThread[]> => {
    const response = await client.get<ApiResponse<QAThread[]>>(ENDPOINTS.QA.THREADS, {
      params: { document_id: documentId },
    });
    return response.data.data;
  },
};
