import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { RecentActivityItem } from '../../../types';
import { FileUp } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';

interface RecentActivityFeedProps {
  activity: RecentActivityItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activity }) => {
  return (
    <Card variant="glass">
      <CardHeader>
        <div>
          <CardTitle>Pipeline Activity Stream</CardTitle>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Real-time event log for document processing & ingestion</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {activity.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-gray-500 text-center py-6">No recent pipeline activity</p>
        ) : (
          <div className="space-y-4">
            {activity.map((item, idx) => (
              <div key={item.id || idx} className="flex items-start gap-3.5 text-xs">
                <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <FileUp className="h-4 w-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-gray-400">
                    <span className="capitalize text-blue-600 dark:text-blue-400 font-semibold">{item.status}</span>
                    <span>•</span>
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
