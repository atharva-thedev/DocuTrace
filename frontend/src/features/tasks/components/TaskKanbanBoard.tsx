import React from 'react';
import { ActionTask, TaskStatus, TaskPriority } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { tasksApi } from '../api/tasksApi';
import { Calendar, CheckCircle2, Clock, Play, XCircle, ArrowRight, FileText } from 'lucide-react';
import { formatDateOnly } from '../../../utils/formatters';

interface TaskKanbanBoardProps {
  tasks: ActionTask[];
  onRefresh: () => void;
}

export const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({ tasks, onRefresh }) => {
  const columns: Array<{ id: TaskStatus; label: string; icon: any; color: string }> = [
    { id: 'pending', label: 'Pending Review', icon: Clock, color: 'border-amber-400 dark:border-amber-500/40' },
    { id: 'in_progress', label: 'In Progress', icon: Play, color: 'border-blue-500 dark:border-blue-500/40' },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'border-emerald-400 dark:border-emerald-500/40' },
    { id: 'cancelled', label: 'Dismissed', icon: XCircle, color: 'border-slate-300 dark:border-slate-800' },
  ];

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await tasksApi.update(taskId, { status: newStatus });
    onRefresh();
  };

  const priorityVariantMap: Record<TaskPriority, 'danger' | 'warning' | 'info' | 'neutral'> = {
    urgent: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'neutral',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const Icon = col.icon;

        return (
          <div key={col.id} className="flex flex-col rounded-2xl bg-slate-100/70 dark:bg-[#0B0F17]/90 border border-slate-200 dark:border-slate-800 p-4 min-h-[500px]">
            {/* Column Header */}
            <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${col.color}`}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">{col.label}</h4>
              </div>
              <span className="h-5 px-2 rounded-full bg-white dark:bg-[#0E131F] text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-xs">
                {colTasks.length}
              </span>
            </div>

            {/* Task Card List */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-xs text-slate-400 dark:text-slate-500 italic">
                  No tasks in this lane
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 transition shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs tracking-tight line-clamp-2">
                        {task.title}
                      </span>
                      <Badge variant={priorityVariantMap[task.priority]} size="sm">
                        {task.priority}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata: Due Date & Source Link */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                      {task.due_date ? (
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDateOnly(task.due_date)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">No deadline</span>
                      )}

                      {task.document_id && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                          <FileText className="h-3 w-3" />
                          <span>Linked Doc</span>
                        </div>
                      )}
                    </div>

                    {/* Move Action Controls */}
                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      {task.status !== 'in_progress' && task.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        >
                          Start
                        </button>
                      )}
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50 font-semibold transition cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      {task.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'cancelled')}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
