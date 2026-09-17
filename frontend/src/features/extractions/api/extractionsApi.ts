import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { ExtractedField, ExtractionSummary, FieldCorrectionPayload, ApiResponse } from '../../../types';

export const extractionsApi = {
  getFields: async (docId: string): Promise<ExtractedField[]> => {
    const response = await client.get<ApiResponse<ExtractedField[]>>(ENDPOINTS.EXTRACTIONS.FIELDS(docId));
    return response.data.data;
  },

  getSummary: async (docId: string): Promise<ExtractionSummary> => {
    const response = await client.get<ApiResponse<ExtractionSummary>>(ENDPOINTS.EXTRACTIONS.SUMMARY(docId));
    return response.data.data;
  },

  updateField: async (fieldId: string, payload: FieldCorrectionPayload): Promise<ExtractedField> => {
    const response = await client.patch<ApiResponse<ExtractedField>>(
      ENDPOINTS.EXTRACTIONS.UPDATE_FIELD(fieldId),
      payload
    );
    return response.data.data;
  },
};
