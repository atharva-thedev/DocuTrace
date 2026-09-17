import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onOpenUploadModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenUploadModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return { title: 'Executive Analytics', subtitle: 'Platform overview & intelligence signals' };
    if (path.startsWith('/documents/')) return { title: 'Document Studio', subtitle: 'Visual spatial evidence & extraction inspector' };
    if (path.startsWith('/documents')) return { title: 'Document Vault', subtitle: 'Ingested records, OCR statuses & metadata' };
    if (path.startsWith('/document-sets')) return { title: '3-Way Reconciliation', subtitle: 'Cross-document matching (Invoice ↔ PO ↔ Contract)' };
    if (path.startsWith('/tasks')) return { title: 'Action Engine', subtitle: 'Assigned tasks, contract commitments & anomaly actions' };
    if (path.startsWith('/qa')) return { title: 'Evidence Q&A Studio', subtitle: 'Evidence-grounded RAG query assistant' };
    if (path.startsWith('/settings')) return { title: 'Workspace Settings', subtitle: 'Profile, security credentials & GDPR controls' };
    return { title: 'DocuTrace Platform', subtitle: 'Active business document intelligence' };
  };

  const breadcrumb = getBreadcrumbs();

  return (
    <header className="h-18 px-8 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-[#0E131F]/90 backdrop-blur-xl flex items-center justify-between shrink-0 select-none z-20 transition-colors">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-display tracking-tight">{breadcrumb.title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{breadcrumb.subtitle}</p>
      </div>

      {/* Center / Right Tools */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
        >
          {theme === 'light' ? (
            <>
              <Moon className="h-4 w-4 text-slate-700" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          )}
        </button>

        {/* System Pipeline Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono">Pipeline Online</span>
        </div>

        {/* Global Upload CTA */}
        {onOpenUploadModal ? (
          <Button
            onClick={onOpenUploadModal}
            variant="primary"
            size="sm"
            icon={<Upload className="h-3.5 w-3.5" />}
          >
            Upload Document
          </Button>
        ) : (
          <Button
            onClick={() => navigate('/documents')}
            variant="primary"
            size="sm"
            icon={<Upload className="h-3.5 w-3.5" />}
          >
            Upload Document
          </Button>
        )}
      </div>
    </header>
  );
};
