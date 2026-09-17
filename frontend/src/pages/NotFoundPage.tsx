import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0B0F17] p-6 text-center transition-colors">
      <div className="glass-panel max-w-md rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 shadow-inner">
          <FileQuestion className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">404 — Page Not Found</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          The requested document intelligence view or workspace route does not exist.
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            variant="primary"
            size="md"
            icon={<Home className="h-4 w-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
