import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { AnomalyRecord } from '../../../types';
import { CheckCircle2 } from 'lucide-react';

interface ResolveAnomalyModalProps {
  isOpen: boolean;
  onClose: () => void;
  anomaly: AnomalyRecord | null;
  onResolve: (anomalyId: string, notes: string) => Promise<void>;
  isLoading?: boolean;
}

export const ResolveAnomalyModal: React.FC<ResolveAnomalyModalProps> = ({
  isOpen,
  onClose,
  anomaly,
  onResolve,
  isLoading = false,
}) => {
  const [notes, setNotes] = useState<string>('');

  if (!anomaly) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    await onResolve(anomaly.id, notes);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Anomaly / Flagged Discrepancy"
      description="Mark this financial or integrity issue as resolved with justification notes."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 dark:bg-[#080C13] rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-500">Anomaly Title:</span>
          <p className="font-bold text-slate-900 dark:text-white mt-0.5">{anomaly.title}</p>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{anomaly.description}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
            Resolution Justification / Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain why this anomaly is approved, waived, or rectified..."
            className="w-full rounded-xl bg-white dark:bg-[#080C13] border border-slate-300 dark:border-slate-800 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            size="md"
            icon={<CheckCircle2 className="h-4 w-4" />}
            loading={isLoading}
          >
            Mark Resolved
          </Button>
        </div>
      </form>
    </Modal>
  );
};
