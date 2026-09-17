import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import {
  Document,
  DocumentDetail,
  DocumentType,
  DocumentStatus,
  ApiResponse,
  PaginatedResponse,
} from '../../../types';

export interface ListDocumentsParams {
  document_type?: DocumentType;
  status?: DocumentStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export const documentsApi = {
  list: async (params?: ListDocumentsParams): Promise<PaginatedResponse<Document>> => {
    const response = await client.get<PaginatedResponse<Document>>(ENDPOINTS.DOCUMENTS.LIST, {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<DocumentDetail> => {
    const response = await client.get<ApiResponse<DocumentDetail>>(ENDPOINTS.DOCUMENTS.DETAIL(id));
    return response.data.data;
  },

  upload: async (file: File, documentType: DocumentType = 'invoice'): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const response = await client.post<ApiResponse<Document>>(
      ENDPOINTS.DOCUMENTS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(ENDPOINTS.DOCUMENTS.DELETE(id));
  },
};
