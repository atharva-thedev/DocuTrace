import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../features/tasks/api/tasksApi';
import { TaskKanbanBoard } from '../features/tasks/components/TaskKanbanBoard';
import { CreateTaskModal } from '../features/tasks/components/CreateTaskModal';
import { TaskPriority } from '../types';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { Plus, RefreshCw } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | ''>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const {
    data: tasks = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['tasks', selectedPriority],
    queryFn: () => tasksApi.list(selectedPriority ? { priority: selectedPriority } : undefined),
    refetchInterval: 15000,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Action & Task Engine</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track and resolve automated obligation deadlines, anomaly remediations, and manual tasks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Priority Filter:
        </span>
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0E131F] rounded-xl border border-slate-200 dark:border-slate-800">
          {[
            { id: '', label: 'All Priorities' },
            { id: 'urgent', label: 'Urgent' },
            { id: 'high', label: 'High' },
            { id: 'medium', label: 'Medium' },
            { id: 'low', label: 'Low' },
          ].map((tier) => {
            const isActive = selectedPriority === tier.id;
            return (
              <button
                key={tier.id || 'all'}
                onClick={() => setSelectedPriority(tier.id as TaskPriority | '')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-blue-500 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Kanban Board */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" label="Loading action board..." />
        </div>
      ) : (
        <TaskKanbanBoard
          tasks={tasks}
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
          }}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        }}
      />
    </div>
  );
};
