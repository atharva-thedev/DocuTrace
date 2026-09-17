import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { tasksApi } from '../api/tasksApi';
import { TaskPriority } from '../../../types';
import { Plus } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  documentId?: string;
  obligationId?: string;
  anomalyId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  documentId,
  obligationId,
  anomalyId,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await tasksApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        document_id: documentId,
        obligation_id: obligationId,
        anomaly_id: anomalyId,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      onCreated();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Action Item / Task"
      description="Create a trackable task linked to a document obligation, risk flag, or verification review."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Verify tax discrepancy with vendor ACME"
          required
          autoFocus
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details on necessary steps or required approvals..."
            className="w-full rounded-xl bg-white dark:bg-[#080C13] border border-slate-300 dark:border-slate-800 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority Tier"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
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
            disabled={!title.trim()}
          >
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
