import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DocumentUploadModal } from '../../features/documents/components/DocumentUploadModal';

export const AppLayout: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white transition-colors relative">
      {/* Ambient background tech grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 dark:opacity-20 pointer-events-none" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        {/* Top Header */}
        <Header onOpenUploadModal={() => setIsUploadModalOpen(true)} />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-[#0B0F17]/90 p-8 relative z-10">
          <Outlet />
        </main>
      </div>

      {/* Global Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};
