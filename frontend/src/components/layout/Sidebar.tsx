import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  GitCompare,
  CheckSquare,
  MessageSquareText,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { Badge } from '../ui/Badge';

import { BrandLogo } from '../ui/BrandLogo';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Executive Analytics', icon: LayoutDashboard },
    { to: '/documents', label: 'Document Vault', icon: FileText },
    { to: '/document-sets', label: '3-Way Reconciliation', icon: GitCompare },
    { to: '/tasks', label: 'Action Engine', icon: CheckSquare },
    { to: '/qa', label: 'Evidence Q&A Studio', icon: MessageSquareText },
    { to: '/settings', label: 'Workspace Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#0E131F] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen select-none transition-colors z-20">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center hover:opacity-90 transition-opacity">
            <BrandLogo size="md" />
          </NavLink>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Intelligence Workspaces
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60 dark:shadow-md dark:shadow-blue-500/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 text-current" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-slate-500" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F17]/50">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-3 shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.full_name || 'DocuTrace User'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">{user?.email}</p>
            </div>
          </div>
          <Badge variant="neutral" size="sm">
            {user?.role || 'member'}
          </Badge>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-red-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-900/40 transition duration-150 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
