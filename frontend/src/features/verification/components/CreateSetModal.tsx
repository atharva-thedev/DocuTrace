import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Document } from '../../../types';
import { verificationApi } from '../api/verificationApi';
import { GitCompare, Plus } from 'lucide-react';

interface CreateSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDocuments: Document[];
  onCreated: () => void;
}

export const CreateSetModal: React.FC<CreateSetModalProps> = ({
  isOpen,
  onClose,
  availableDocuments,
  onCreated,
}) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await verificationApi.createSet({
        name: name.trim(),
        description: description.trim() || undefined,
        document_ids: selectedDocIds,
      });
      setName('');
      setDescription('');
      setSelectedDocIds([]);
      onCreated();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Cross-Document Bundle Set"
      description="Group related documents (e.g. Invoice + PO + Contract) for 3-way reconciliation."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Document Set Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme Corp — Hardware Supply Q3 Bundle"
          required
        />

        <Input
          label="Description / Purpose (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. 3-way reconciliation for Vendor invoice vs PO #4091"
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2">
            Select Documents to Include ({selectedDocIds.length} selected)
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-100/60 dark:bg-[#080C13] border border-slate-200 dark:border-slate-800">
            {availableDocuments.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-500 text-center py-4">No documents available to bundle.</p>
            ) : (
              availableDocuments.map((doc) => {
                const isChecked = selectedDocIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      isChecked
                        ? 'bg-blue-600/15 border-blue-500/60 text-slate-900 dark:text-white font-medium'
                        : 'bg-white dark:bg-[#0E131F] border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate max-w-xs">
                      <p className="text-slate-900 dark:text-white truncate font-semibold">{doc.original_filename}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{doc.document_type}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Plus className="h-4 w-4" />}
            loading={isSubmitting}
            disabled={!name.trim()}
          >
            Create Bundle Set
          </Button>
        </div>
      </form>
    </Modal>
  );
};
