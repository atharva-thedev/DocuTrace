import React from 'react';
import { DashboardSummary } from '../../../types';
import { StatCard } from '../../../components/ui/StatCard';
import { FileText, ShieldAlert, AlertTriangle, CheckSquare } from 'lucide-react';

interface OverviewCardsProps {
  summary: DashboardSummary;
  onNavigate?: (tab: string) => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Documents"
        value={summary.total_documents}
        subtitle={`${summary.processing_documents} currently in pipeline`}
        icon={<FileText className="h-5 w-5 text-slate-700 dark:text-white" />}
        color="blue"
        trend={{ value: '+12%', isPositive: true }}
      />

      <StatCard
        title="Flagged Risk Documents"
        value={summary.flagged_documents}
        subtitle="Requires compliance / financial review"
        icon={<ShieldAlert className="h-5 w-5 text-red-500 dark:text-red-400" />}
        color="red"
      />

      <StatCard
        title="Unresolved Anomalies"
        value={summary.unresolved_anomalies}
        subtitle={`Out of ${summary.total_anomalies} total detected`}
        icon={<AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />}
        color="amber"
      />

      <StatCard
        title="Active Action Tasks"
        value={summary.pending_tasks}
        subtitle={`Out of ${summary.total_tasks} total tasks`}
        icon={<CheckSquare className="h-5 w-5 text-slate-700 dark:text-white" />}
        color="emerald"
      />
    </div>
  );
};
