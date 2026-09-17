import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import {
  DocumentSet,
  DocumentSetCreatePayload,
  VerificationResult,
  ApiResponse,
} from '../../../types';

export const verificationApi = {
  listSets: async (): Promise<DocumentSet[]> => {
    const response = await client.get<ApiResponse<DocumentSet[]>>(ENDPOINTS.DOCUMENT_SETS.LIST);
    return response.data.data;
  },

  createSet: async (payload: DocumentSetCreatePayload): Promise<DocumentSet> => {
    const response = await client.post<ApiResponse<DocumentSet>>(
      ENDPOINTS.DOCUMENT_SETS.CREATE,
      payload
    );
    return response.data.data;
  },

  getSet: async (id: string): Promise<DocumentSet> => {
    const response = await client.get<ApiResponse<DocumentSet>>(ENDPOINTS.DOCUMENT_SETS.DETAIL(id));
    return response.data.data;
  },

  addDocumentToSet: async (setId: string, documentId: string, roleInSet?: string): Promise<void> => {
    await client.post(ENDPOINTS.DOCUMENT_SETS.ADD_DOC(setId), {
      document_id: documentId,
      role_in_set: roleInSet,
    });
  },

  triggerVerification: async (setId: string): Promise<VerificationResult> => {
    const response = await client.post<ApiResponse<VerificationResult>>(
      ENDPOINTS.VERIFICATIONS.TRIGGER(setId)
    );
    return response.data.data;
  },

  getResults: async (setId: string): Promise<VerificationResult> => {
    const response = await client.get<ApiResponse<VerificationResult>>(
      ENDPOINTS.VERIFICATIONS.RESULTS(setId)
    );
    return response.data.data;
  },
};
