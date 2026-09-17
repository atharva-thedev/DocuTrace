import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ExtractedField } from '../../../types';
import { Edit3, Check } from 'lucide-react';

interface FieldCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: ExtractedField | null;
  onSave: (fieldId: string, newValue: string) => Promise<void>;
  isLoading?: boolean;
}

export const FieldCorrectionModal: React.FC<FieldCorrectionModalProps> = ({
  isOpen,
  onClose,
  field,
  onSave,
  isLoading = false,
}) => {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (field) {
      setValue(field.field_value || '');
    }
  }, [field]);

  if (!field) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    await onSave(field.id, value);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Correct Extracted Field Value"
      description="Apply human-in-the-loop verification override to update this record."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-3 bg-slate-50 dark:bg-[#080C13] rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-500">Field Name:</span>
          <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wide mt-0.5">{field.field_name}</p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Category: {field.field_category}</span>
            <span>•</span>
            <span>Page {field.page_number}</span>
          </div>
        </div>

        <Input
          label="Field Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter corrected value..."
          autoFocus
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Check className="h-4 w-4" />}
            loading={isLoading}
          >
            Save Correction
          </Button>
        </div>
      </form>
    </Modal>
  );
};
