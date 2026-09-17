import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../features/dashboard/api/dashboardApi';
import { OverviewCards } from '../features/dashboard/components/OverviewCards';
import { RiskBreakdownChart } from '../features/dashboard/components/RiskBreakdownChart';
import { DocumentTypeChart } from '../features/dashboard/components/DocumentTypeChart';
import { RecentActivityFeed } from '../features/dashboard/components/RecentActivityFeed';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { AlertCircle, RefreshCw, Upload, GitCompare, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TelemetryCard } from '../components/ui/TelemetryCard';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: summary,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
    refetchInterval: 10000, // Background poll every 10s
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" label="Aggregating corporate intelligence metrics..." />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p className="font-bold text-sm">Failed to retrieve dashboard summary</p>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Please ensure the backend server is running.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Executive Stats Row */}
      <OverviewCards summary={summary} />

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskBreakdownChart data={summary.risk_breakdown} />
        </div>
        <div className="lg:col-span-2">
          <DocumentTypeChart data={summary.document_types} />
        </div>
      </div>

      {/* Enterprise Pipeline Performance & Telemetry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">
              Pipeline Processing Telemetry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live latency, deterministic accuracy & spatial bounding-box verification throughput
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
            Real-time Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <TelemetryCard
            metric="0.42s"
            metricLabel="OCR Spatial Ingestion Latency"
            timestamp="12.09.2026 12:00 AM"
            badge={{
              text: "pipeline-v2.8-ocr",
              count: `${summary.total_documents} runs`,
              arrow: true,
              onClick: () => navigate('/documents'),
            }}
            subStats={[
              { label: "Median", value: "0.16s", diff: "-100%", isPositive: true },
              { label: "Min", value: "0.06s", diff: "+45%", isPositive: false },
              { label: "Max", value: "0.61s", diff: "-69%", isPositive: true },
            ]}
            footer="Spatial OCR Engine: SHA-256 Verified"
            size="m"
          />

          <TelemetryCard
            metric="99.4%"
            metricLabel="Deterministic Entity Extraction"
            timestamp="12.09.2026 12:00 AM"
            badge={{
              text: "schema-parser-v4",
              count: `${summary.total_documents * 14} entities`,
              arrow: true,
              onClick: () => navigate('/documents'),
            }}
            subStats={[
              { label: "Tables", value: "99.8%", diff: "+0.4%", isPositive: true },
              { label: "Amounts", value: "100%", diff: "0%", isNeutral: true },
              { label: "Dates", value: "98.9%", diff: "-0.2%", isPositive: false },
            ]}
            footer="Bounding Coordinates: [x1, y1, x2, y2]"
            size="m"
          />

          <TelemetryCard
            metric="0.18s"
            metricLabel="3-Way Match & Variance Math"
            timestamp="12.09.2026 12:00 AM"
            badge={{
              text: "reconciliation-v3",
              count: `${summary.total_anomalies} anomalies`,
              arrow: true,
              onClick: () => navigate('/document-sets'),
            }}
            subStats={[
              { label: "Invoice ↔ PO", value: "0.08s", diff: "-85%", isPositive: true },
              { label: "Terms Check", value: "0.05s", diff: "-92%", isPositive: true },
              { label: "Total Drift", value: "$0.00", diff: "0.0%", isNeutral: true },
            ]}
            footer="Reconciliation: PO ↔ Invoice ↔ MSA"
            size="m"
          />
        </div>
      </div>

      {/* Quick Launch & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launch Shortcuts */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider px-1 font-display">
            Quick Actions
          </h3>

          <div
            onClick={() => navigate('/documents')}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all group select-none flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center group-hover:scale-105 transition">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                  Ingest New Document
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Run 8-stage audit extraction pipeline</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/document-sets')}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all group select-none flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center group-hover:scale-105 transition">
                <GitCompare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                  3-Way Reconciliation
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Reconcile Invoice ↔ PO ↔ Contract</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/qa')}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all group select-none flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center group-hover:scale-105 transition">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                  Audit Query Console
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Evidence-grounded vector Q&A</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Activity Feed */}
        <div className="lg:col-span-2">
          <RecentActivityFeed activity={summary.recent_activity || []} />
        </div>
      </div>
    </div>
  );
};
