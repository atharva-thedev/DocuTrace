import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../../components/ui/BrandLogo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('auditor@docutrace.io');
  const [password, setPassword] = useState<string>('DocuTrace@2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (!err.response) {
        setError('Unable to connect to backend server. Please ensure the backend is running on port 8000.');
      } else {
        setError(
          err.response?.data?.error?.message ||
            'Failed to sign in. Please verify your credentials or register a new account.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (provider: string) => {
    if (provider === 'Google') {
      setEmail('auditor@docutrace.io');
      setPassword('DocuTrace@2026!');
    } else {
      setEmail('admin@docutrace.io');
      setPassword('DocuTrace@2026!');
    }
  };

  const fillDemo = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('DocuTrace@2026!');
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-[#0B0F17] text-gray-900 dark:text-white font-sans selection:bg-slate-700 selection:text-white overflow-hidden transition-colors">
      {/* ── Left Column: Authentication Form ──────────────────────────────── */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto">
        <div className="w-full max-w-[400px] flex flex-col justify-center">
          
          {/* Brand Header */}
          <div className="mb-6">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <BrandLogo size="lg" />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              Welcome Back!
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              Sign in to access your dashboard and continue optimizing your QA process.
            </p>
          </div>

          {error && (
            <div className="mb-3.5 flex items-start gap-2.5 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {forgotSent && (
            <div className="mb-3.5 flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 text-xs">
              <span>Password reset instructions sent to your email!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500 dark:text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
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
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-white hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm transition duration-150 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* OR Divider */}
          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white dark:bg-[#0B0F17] px-2.5 text-gray-400 dark:text-slate-500 font-semibold tracking-wider">
                OR
              </span>
            </div>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleSocialClick('Google')}
              className="w-full h-9.5 flex items-center justify-center gap-2.5 px-3 rounded-lg border border-gray-300 dark:border-slate-800 bg-white dark:bg-[#0E131F] hover:bg-gray-50/80 dark:hover:bg-slate-800/80 text-xs font-medium text-gray-700 dark:text-slate-200 transition shadow-2xs cursor-pointer"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialClick('Apple')}
              className="w-full h-9.5 flex items-center justify-center gap-2.5 px-3 rounded-lg border border-gray-300 dark:border-slate-800 bg-white dark:bg-[#0E131F] hover:bg-gray-50/80 dark:hover:bg-slate-800/80 text-xs font-medium text-gray-700 dark:text-slate-200 transition shadow-2xs cursor-pointer"
            >
              <svg className="h-3.5 w-3.5 shrink-0 fill-current text-gray-900 dark:text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.47c.65-.79 1.1-1.89.98-2.99-.95.04-2.09.64-2.76 1.43-.59.68-1.11 1.8-0.97 2.87 1.05.08 2.1-.52 2.75-1.31z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Quick Demo Presets */}
          <div className="mt-3.5 pt-2 flex items-center justify-center gap-2">
            <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold">Demo:</span>
            <button
              type="button"
              onClick={() => fillDemo('auditor@docutrace.io')}
              className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-[#0E131F] dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400 text-[11px] font-medium text-gray-600 transition cursor-pointer border border-transparent dark:border-slate-800"
            >
              Auditor
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@docutrace.io')}
              className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-[#0E131F] dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400 text-[11px] font-medium text-gray-600 transition cursor-pointer border border-transparent dark:border-slate-800"
            >
              Admin
            </button>
          </div>

          {/* Sign Up Redirect */}
          <p className="mt-3.5 text-center text-xs text-gray-600 dark:text-slate-400">
            Don't have an Account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline transition"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Column: Hero Showcase & Testimonial ─────────────────────── */}
      <div className="hidden lg:flex w-1/2 h-full relative bg-gradient-to-br from-[#172554] via-[#1E3A8A] to-[#0F172A] text-white items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 overflow-hidden">
        {/* Subtle decorative background light / glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content: Headline & Testimonial */}
        <div className="relative z-10 w-full max-w-[480px] flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl 2xl:text-[42px] font-bold tracking-tight leading-[1.2] text-white mb-6">
            Turn Every Document<br />into a Business Advantage
          </h2>

          <div className="space-y-3">
            {/* Zero-padding vector quote mark flush with left margin */}
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
