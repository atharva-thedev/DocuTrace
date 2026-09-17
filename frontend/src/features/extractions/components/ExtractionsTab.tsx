import React, { useState } from 'react';
import { ExtractedField } from '../../../types';
import { ConfidenceScoreBadge } from './ConfidenceScoreBadge';
import { FieldCorrectionModal } from './FieldCorrectionModal';
import { extractionsApi } from '../api/extractionsApi';
import { Search, Edit2, Sparkles } from 'lucide-react';
import { EmptyState } from '../../../components/ui/EmptyState';

interface ExtractionsTabProps {
  fields: ExtractedField[];
  selectedFieldId?: string | null;
  onSelectField: (field: ExtractedField) => void;
  onRefresh?: () => void;
}

export const ExtractionsTab: React.FC<ExtractionsTabProps> = ({
  fields,
  selectedFieldId,
  onSelectField,
  onRefresh,
}) => {
  const [search, setSearch] = useState<string>('');
  const [editingField, setEditingField] = useState<ExtractedField | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Group fields by category
  const filteredFields = fields.filter(
    (f) =>
      (f.field_key || f.field_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.field_value || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.field_category || '').toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(filteredFields.map((f) => f.field_category || 'General')));

  const handleSaveCorrection = async (fieldId: string, newValue: string) => {
    try {
      setIsUpdating(true);
      await extractionsApi.updateField(fieldId, { field_value: newValue });
      if (onRefresh) onRefresh();
    } finally {
      setIsUpdating(false);
    }
  };

  if (fields.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-8 w-8 text-blue-500" />}
        title="No Extracted Fields Yet"
        description="This document may still be queued or processing in the intelligence pipeline."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Filter extracted fields by key or value..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-[#080C13] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition shadow-sm"
        />
      </div>

      {/* Fields Grouped by Category */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const catFields = filteredFields.filter((f) => (f.field_category || 'General') === cat);
          return (
            <div key={cat} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {cat} ({catFields.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {catFields.map((field) => {
                  const isSelected = field.id === selectedFieldId;
                  const fieldLabel = (field.field_key || field.field_name || 'field').replace(/_/g, ' ');

                  return (
                    <div
                      key={field.id}
                      onClick={() => onSelectField(field)}
                      className={`group p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 shadow-md dark:bg-blue-950/40 dark:border-blue-500/80 dark:shadow-blue-500/10'
                          : 'bg-white border-slate-200 dark:bg-[#0E131F] dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm'
                      }`}
                    >
                      <div className="flex-1 pr-3 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide truncate">
                            {fieldLabel}
                          </span>
                          {field.is_corrected && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 text-[9px] font-bold border border-blue-200 dark:border-blue-800/60">
                              Corrected
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white font-mono truncate">
                          {field.field_value || '—'}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>Page {field.page_number}</span>
                          {field.normalized_value && field.normalized_value !== field.field_value && (
                            <>
                              <span>•</span>
                              <span className="truncate text-slate-500 dark:text-slate-400">
                                Norm: {field.normalized_value}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <ConfidenceScoreBadge score={field.confidence_score} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingField(field);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Edit Extracted Value"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Field Correction Modal */}
      <FieldCorrectionModal
        isOpen={Boolean(editingField)}
        onClose={() => setEditingField(null)}
        field={editingField}
        onSave={handleSaveCorrection}
        isLoading={isUpdating}
      />
    </div>
  );
};
