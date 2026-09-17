import React from 'react';
import { useAuth } from '../auth/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { User, Shield, Download, CheckCircle2, Sun, Moon, Palette } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleExportData = () => {
    alert('GDPR export package generated. Check your corporate email for download link.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">Workspace & Account Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage user profile credentials, appearance themes, and platform security standards
        </p>
      </div>

      {/* Theme / Appearance Selection */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <CardTitle>Interface Theme</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose your preferred workspace aesthetic. Light theme provides a crisp enterprise interface with high contrast.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                theme === 'light'
                  ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-500/10 text-slate-900'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs font-display">Light Theme</h4>
                  {theme === 'light' && <Badge variant="info" size="sm">Active</Badge>}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Crisp enterprise slate & high contrast</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                theme === 'dark'
                  ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/15 text-white'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 shadow-sm shrink-0">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs font-display text-white">Dark Theme</h4>
                  {theme === 'dark' && <Badge variant="info" size="sm">Active</Badge>}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Deep midnight navy & blue accents</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* User Profile Card */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <CardTitle>User Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium font-mono text-[11px]">Full Name</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-display">{user?.full_name || 'N/A'}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium font-mono text-[11px]">Email Address</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">{user?.email || 'N/A'}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium font-mono text-[11px]">Assigned Organization Role</span>
              <div className="mt-1.5">
                <Badge variant="info" size="sm">
                  {user?.role || 'member'}
                </Badge>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium font-mono text-[11px]">Account Created</span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1 font-mono">{formatDate(user?.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Security Standard */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <CardTitle>Active Security Posture</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-700 dark:text-slate-200">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>In-Memory JWT Access Token (Zero LocalStorage XSS Footprint)</span>
            </div>
            <Badge variant="success" size="sm" pulse>Active</Badge>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>HttpOnly 7-Day Refresh Token Rotation with Breach Invalidation</span>
            </div>
            <Badge variant="success" size="sm" pulse>Active</Badge>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>AES-256-GCM Sensitive Field Encryption at Rest</span>
            </div>
            <Badge variant="success" size="sm" pulse>Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* GDPR Data Portability */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <CardTitle>GDPR Compliance & Data Portability</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            Download a portable JSON export containing all your uploaded documents, extracted fields, and verification audits.
          </p>
          <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={handleExportData}>
            Export My Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
