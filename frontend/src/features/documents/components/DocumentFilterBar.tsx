import React from 'react';
import { Search } from 'lucide-react';
import { DocumentType, DocumentStatus } from '../../../types';

interface DocumentFilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedType: DocumentType | '';
  onTypeChange: (type: DocumentType | '') => void;
  selectedStatus: DocumentStatus | '';
  onStatusChange: (status: DocumentStatus | '') => void;
}

export const DocumentFilterBar: React.FC<DocumentFilterBarProps> = ({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
}) => {
  const typeTabs: Array<{ id: DocumentType | ''; label: string }> = [
    { id: '', label: 'All Documents' },
    { id: 'invoice', label: 'Invoices' },
    { id: 'po', label: 'Purchase Orders' },
    { id: 'contract', label: 'Contracts' },
    { id: 'financial_report', label: 'Financial Reports' },
    { id: 'compliance', label: 'Compliance' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 dark:bg-[#0E131F] rounded-xl border border-slate-200 dark:border-slate-800">
        {typeTabs.map((tab) => {
          const isActive = selectedType === tab.id;
          return (
            <button
              key={tab.id || 'all'}
              onClick={() => onTypeChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-blue-500 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right Controls: Search & Status Dropdown */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search filename..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0E131F] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition shadow-sm"
          />
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as DocumentStatus | '')}
          className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0E131F] border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-white focus:outline-none focus:border-blue-500 transition shadow-sm cursor-pointer"
        >
          <option value="" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">All Statuses</option>
          <option value="completed" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">Ready</option>
          <option value="processing" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">Processing</option>
          <option value="queued" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">Queued</option>
          <option value="error" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">Failed</option>
        </select>
      </div>
    </div>
  );
};
