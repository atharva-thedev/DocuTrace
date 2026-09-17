import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>('auditor');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(fullName, email, password, role);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      if (!err.response) {
        setError('Unable to connect to backend server. Please ensure the backend is running on port 8000.');
      } else {
        setError(
          err.response?.data?.error?.message ||
            'Failed to create account. Please check your details and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-[#0B0F17] text-gray-900 dark:text-white font-sans selection:bg-slate-700 selection:text-white overflow-hidden transition-colors">
      {/* ── Left Column: Authentication Form ──────────────────────────────── */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto">
        <div className="w-full max-w-[400px] flex flex-col justify-center">
          
          {/* Brand Header */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <span className="font-mono text-xs font-bold tracking-tighter">{`{...}`}</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              DocuTrace
            </span>
          </div>

          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              Get Started
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              Create your organization account to experience automated document auditing.
            </p>
          </div>

          {error && (
            <div className="mb-3.5 flex items-start gap-2.5 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="w-full h-10 rounded-lg border border-gray-300 dark:border-slate-800 bg-white dark:bg-[#0E131F] px-3 pl-9 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition duration-150 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Corporate Email */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300">
                Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500 dark:text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full h-10 rounded-lg border border-gray-300 dark:border-slate-800 bg-white dark:bg-[#0E131F] px-3 pl-9 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition duration-150 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="w-full h-10 rounded-lg border border-gray-300 dark:border-slate-800 bg-white dark:bg-[#0E131F] px-3 pl-9 pr-9 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition duration-150 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-white focus:outline-hidden cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Organization Role */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300">
                Organization Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-10 rounded-lg border border-gray-300 dark:border-slate-800 bg-white dark:bg-[#0E131F] px-3 text-xs sm:text-sm text-gray-900 dark:text-white transition duration-150 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="auditor" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">Auditor (Verification & Discrepancies)</option>
                <option value="manager" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">Manager (Approvals & Task Orchestration)</option>
                <option value="admin" className="bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white">Administrator (Full System Controls)</option>
              </select>
            </div>

            {/* Submit */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm transition duration-150 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Sign In Redirect */}
          <p className="mt-3.5 text-center text-xs text-gray-600 dark:text-slate-400">
            Already have an Account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline transition"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Column: Hero Showcase & Testimonial ─────────────────────── */}
      <div className="hidden lg:flex w-1/2 h-full relative bg-gradient-to-br from-[#172554] via-[#1E3A8A] to-[#0F172A] text-white items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[480px] flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl 2xl:text-[42px] font-bold tracking-tight leading-[1.2] text-white mb-6">
            Turn Every Document<br />into a Business Advantage
          </h2>

          <div className="space-y-3">
            <div className="flex items-center text-blue-300 select-none">
              <svg
                className="w-5 h-3.5 text-blue-300"
                viewBox="0 0 20 14"
                fill="none"
              >
                <path
                  d="M0 8.5C0 3.8 3.2 0.8 8 0L7 2.8C4.5 3.5 3.3 5 3.1 7.2H8V14H0V8.5ZM12 8.5C12 3.8 15.2 0.8 20 0L19 2.8C16.5 3.5 15.3 5 15.1 7.2H20V14H12V8.5Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <p className="text-sm sm:text-base xl:text-[17px] text-white/95 leading-[1.65] font-normal tracking-normal text-left break-normal hyphens-none">
              "DocuTrace has completely transformed our testing process. It's reliable, efficient, and ensures our releases are always top-notch."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
