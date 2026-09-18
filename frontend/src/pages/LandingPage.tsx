import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { BrandLogo } from '../components/ui/BrandLogo';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  GitCompare,
  CheckSquare,
  Search,
  Lock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Database,
  Layers,
  FileCheck,
  TrendingDown,
  Sun,
  Moon,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Hash,
  Activity,
  Zap,
  Cpu,
  Check,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/ui/Button';
import { SegmentedProgressBar } from '../components/ui/SegmentedProgressBar';
import { TelemetryCard } from '../components/ui/TelemetryCard';

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Interactive demo state for live product inspector section
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('f1');

  const sampleDocuments = [
    {
      id: 'doc-invoice',
      name: 'Commercial_Invoice_AcmeCorp_INV-2026-88.pdf',
      type: 'Invoice',
      vendor: 'Acme Cloud Solutions Inc.',
      amount: '$142,500.00',
      date: 'Sep 12, 2026',
      status: 'Verified with Flag',
      hash: 'sha256:8f9a2e3b...c419',
      riskScore: 68,
      riskLevel: 'Moderate Risk',
      fields: [
        {
          id: 'f1',
          name: 'Total Invoice Amount',
          value: '$142,500.00',
          confidence: 0.994,
          page: 1,
          bbox: [58.2, 220.4, 180.1, 245.8],
          status: 'verified',
          note: 'Matches parsed subtotal + tax formula',
        },
        {
          id: 'f2',
          name: 'Payment Terms',
          value: 'Net 30 Days',
          confidence: 0.982,
          page: 1,
          bbox: [58.0, 260.0, 150.5, 280.0],
          status: 'mismatch',
          note: 'Contract specifies Net 60 Days (30-day conflict)',
        },
        {
          id: 'f3',
          name: 'Tax Calculation',
          value: '$12,500.00 (9.6%)',
          confidence: 0.991,
          page: 1,
          bbox: [58.0, 300.2, 170.0, 320.0],
          status: 'verified',
          note: 'Exact math verified against line items',
        },
        {
          id: 'f4',
          name: 'Line Item Unit Price',
          value: '$2,850.00 / seat',
          confidence: 0.974,
          page: 1,
          bbox: [58.0, 340.0, 190.0, 360.0],
          status: 'anomaly',
          note: '4.8% price creep vs. PO unit price of $2,720.00',
        },
      ],
      anomalies: [
        {
          type: 'Unit Price Discrepancy',
          severity: 'high',
          description: 'Invoice unit price ($2,850.00) exceeds PO #PO-9412 rate ($2,720.00) by $130.00/unit.',
        },
        {
          type: 'Payment Term Conflict',
          severity: 'medium',
          description: 'Invoice specifies Net 30, but Master Services Agreement #MSA-2025 mandates Net 60.',
        },
      ],
      obligations: [
        {
          title: 'Remit invoice payment within 30 days',
          due: 'Oct 12, 2026',
          category: 'Payment',
          assignedTo: 'Accounts Payable',
        },
      ],
    },
    {
      id: 'doc-msa',
      name: 'Master_Services_Agreement_NovaCore_MSA-2025.pdf',
      type: 'Contract',
      vendor: 'NovaCore Technologies LLC',
      amount: '$480,000.00 / yr',
      date: 'Jan 15, 2025',
      status: 'Active Obligation',
      hash: 'sha256:3a7d1c9e...e802',
      riskScore: 42,
      riskLevel: 'Low Risk',
      fields: [
        {
          id: 'f1',
          name: 'Annual Contract Value',
          value: '$480,000.00',
          confidence: 0.995,
          page: 1,
          bbox: [60.0, 210.0, 185.0, 235.0],
          status: 'verified',
          note: 'Base fee payable quarterly in advance',
        },
        {
          id: 'f2',
          name: 'Renewal Notice Period',
          value: '60 Days Prior to Expiry',
          confidence: 0.984,
          page: 3,
          bbox: [60.0, 250.0, 210.0, 275.0],
          status: 'action_required',
          note: 'Automatic rollover occurs if notice missed by Nov 15, 2026',
        },
        {
          id: 'f3',
          name: 'Governing Law',
          value: 'State of Delaware, USA',
          confidence: 0.999,
          page: 8,
          bbox: [60.0, 410.0, 220.0, 430.0],
          status: 'verified',
          note: 'Jurisdiction standard commercial arbitration',
        },
      ],
      anomalies: [],
      obligations: [
        {
          title: 'Issue non-renewal notice to vendor',
          due: 'Nov 15, 2026',
          category: 'Compliance',
          assignedTo: 'Legal Team',
        },
        {
          title: 'Conduct annual vendor security SOC 2 review',
          due: 'Dec 01, 2026',
          category: 'Security',
          assignedTo: 'SecOps',
        },
      ],
    },
    {
      id: 'doc-po',
      name: 'Purchase_Order_AcmeCorp_PO-9412.pdf',
      type: 'Purchase Order',
      vendor: 'Acme Cloud Solutions Inc.',
      amount: '$136,000.00',
      date: 'Aug 28, 2026',
      status: 'Approved Baseline',
      hash: 'sha256:5b2f8a11...d904',
      riskScore: 18,
      riskLevel: 'Minimal Risk',
      fields: [
        {
          id: 'f1',
          name: 'PO Authorized Total',
          value: '$136,000.00',
          confidence: 0.998,
          page: 1,
          bbox: [55.0, 195.0, 175.0, 220.0],
          status: 'verified',
          note: 'Authorized spend cap approved by VP Engineering',
        },
        {
          id: 'f2',
          name: 'Agreed Unit Rate',
          value: '$2,720.00 / seat (50 units)',
          confidence: 0.992,
          page: 1,
          bbox: [55.0, 240.0, 200.0, 265.0],
          status: 'verified',
          note: 'Approved rate for Q3 cloud compute licenses',
        },
      ],
      anomalies: [],
      obligations: [
        {
          title: 'Verify goods received voucher before finance release',
          due: 'Sep 25, 2026',
          category: 'Verification',
          assignedTo: 'Warehouse Ops',
        },
      ],
    },
  ];

  const currentDoc = sampleDocuments[selectedDocIndex];

  // Motion animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white transition-colors">
      {/* ── Top Enterprise Navigation ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#0B0F17]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group hover:opacity-90 transition-opacity">
            <BrandLogo size="md" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#interactive-demo" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Live Product Demo
            </a>
            <a href="#evidence-grounding" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Evidence Grounding
            </a>
            <a href="#three-way-match" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              3-Way Reconciliation
            </a>
            <a href="#anomalies-risk" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Anomaly Detection
            </a>
            <a href="#security" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Security & Architecture
            </a>
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {theme === 'light' ? <Moon className="h-4 w-4 text-slate-700" /> : <Sun className="h-4 w-4 text-amber-300" />}
            </button>

            {user ? (
              <Button
                onClick={() => navigate('/dashboard')}
                variant="primary"
                size="sm"
                icon={<ChevronRight className="h-3.5 w-3.5" />}
              >
                Go to Workspace
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="shimmer-btn px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition active:scale-95"
                >
                  Launch Platform
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── 1. Hero Section (Enhanced Typography & Animation) ──────────────── */}
      <section className="relative pt-10 pb-20 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        {/* Ambient Animated Gradient Orbs and Tech Grid */}
        <div className="absolute inset-0 bg-tech-grid opacity-60 dark:opacity-35 pointer-events-none [mask-image:radial-gradient(ellipse_60%_55%_at_50%_20%,#000_65%,transparent_100%)]" />
        
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-blue-500/18 via-indigo-500/12 to-transparent blur-[110px] rounded-full pointer-events-none animate-pulse-slow" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-600/10 blur-[90px] rounded-full pointer-events-none" />

        {/* Floating Interactive Micro-Widgets (Only on ultra-wide screens to prevent text overlap) */}
        <div className="hidden 2xl:block absolute left-8 2xl:left-14 top-16 z-20 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="animate-float"
          >
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl max-w-[240px] space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  BBox Grounded
                </span>
                <span className="text-slate-400 font-bold">99.4% Conf</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Invoice Total: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">$142,500.00</span>
              </p>
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-mono text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>[58.2, 220.4, 180.1]</span>
                <span className="text-blue-500 font-bold">Page 1</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="hidden 2xl:block absolute right-8 2xl:right-14 top-20 z-20 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="animate-float-delayed"
          >
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl max-w-[240px] space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                  3-Way Match
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                  PO ↔ INV
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Variance Delta: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">$0.00 (Approved)</span>
              </p>
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-mono text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>50 Compute Seats</span>
                <span className="text-emerald-500 font-bold">Matched ✓</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Enterprise Category Eyebrow Pill */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/30 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-[0.16em] uppercase shadow-xs backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400" />
                </span>
                DOCUMENT INTELLIGENCE & AUDIT AUTOMATION
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-[-0.035em] text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.08] [text-wrap:balance]"
            >
              Turn Contracts, Invoices, and Reports into{' '}
              <span className="text-gradient-brand drop-shadow-xs inline-block">
                Traceable Business Actions
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal [text-wrap:balance]"
            >
              DocuTrace extracts critical obligations, financial metrics, and cross-document discrepancies across commercial records. Every single figure is verifiable and mapped back to source bounding box coordinates.
            </motion.p>

            {/* Primary Action Buttons with Micro-Interactions */}
            <motion.div
              variants={itemVariants}
              className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            >
              <a
                href="#interactive-demo"
                className="shimmer-btn w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Explore Interactive Demo</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </a>

              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <Lock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span>Sign In to Organization Vault</span>
              </Link>
            </motion.div>

            {/* Key Architecture Metrics Bar */}
            <motion.div
              variants={itemVariants}
              className="mt-16 pt-10 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left max-w-5xl mx-auto w-full"
            >
              <div className="glass-card-interactive p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <p className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight">100%</p>
                  <Eye className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 font-display">
                  Evidence Grounding
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Pixel BBox coordinates for every token
                </p>
              </div>

              <div className="glass-card-interactive p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <p className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight">3-Way</p>
                  <GitCompare className="h-4 w-4 text-indigo-500" />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 font-display">
                  Reconciliation
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Invoice ↔ PO ↔ Contract matching
                </p>
              </div>

              <div className="glass-card-interactive p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <p className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">Isolation Forest</p>
                  <Activity className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 font-display">
                  Statistical Outliers
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Unsupervised spending risk scoring
                </p>
              </div>

              <div className="glass-card-interactive p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <p className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">AES-256-GCM</p>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 font-display">
                  Zero Data Leakage
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Field-level encryption & SHA-256 hashes
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Interactive Product Inspector (Live Demo Simulator) ─────────── */}
      <section id="interactive-demo" className="py-24 bg-slate-100/80 dark:bg-[#0E131F] border-b border-slate-200/80 dark:border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wider uppercase mb-3">
              <Zap className="h-3.5 w-3.5" />
              Live Interactive Simulator
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-display">
              Experience the Verification Engine in Action
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
              Select an enterprise commercial record below to inspect extracted entities, OCR bounding boxes, and cross-field discrepancy checks in real time.
            </p>
          </motion.div>

          {/* Sample Document Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
            {sampleDocuments.map((doc, idx) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  setSelectedDocIndex(idx);
                  setSelectedFieldId(doc.fields[0]?.id || 'f1');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer flex items-center gap-2 ${
                  selectedDocIndex === idx
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>{doc.type}: {doc.name.split('_')[0]}</span>
              </button>
            ))}
          </div>

          {/* Interactive Split-Screen Studio Component */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Left Pane: Document Canvas Simulation */}
            <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B0F17]/70 flex flex-col justify-between relative overflow-hidden">
              {/* Laser OCR Scanline Animation Effect */}
              <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_#3B82F6] animate-scanline pointer-events-none z-20" />

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[240px] sm:max-w-none">{currentDoc.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">{currentDoc.type}</span>
                  </div>
                  <span className="font-bold">Page 1 of 1</span>
                </div>

                {/* Simulated Document Canvas View with Bounding Boxes */}
                <div className="mt-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-h-[380px] relative font-mono text-xs text-slate-800 dark:text-white shadow-sm space-y-4">
                  {/* Header metadata */}
                  <div className="flex justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white font-display">{currentDoc.vendor}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Issue Date: {currentDoc.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">RECORD INTEGRITY</p>
                      <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">{currentDoc.hash}</p>
                    </div>
                  </div>

                  {/* Document Body with Interactive Bounding Boxes */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      This formal record details the commercial transaction, agreed deliverables, rate structures, and governance terms between the executing parties.
                    </p>

                    <div className="grid grid-cols-1 gap-2.5 pt-2">
                      {currentDoc.fields.map((field) => (
                        <div
                          key={field.id}
                          onClick={() => setSelectedFieldId(field.id)}
                          className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                            selectedFieldId === field.id
                              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 dark:bg-blue-950/40 dark:border-blue-400 bbox-active-pulse'
                              : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${field.status === 'anomaly' || field.status === 'mismatch' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{field.name}:</span>
                            <span className="text-xs text-slate-800 dark:text-slate-200 font-bold">{field.value}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">BBox [{field.bbox.join(', ')}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="pt-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-blue-500" />
                  OCR Engine: 300 DPI Spatial Grid
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> 100% Vector Citation Grounded
                </span>
              </div>
            </div>

            {/* Right Pane: Structured Extraction, Risk, and Obligations Inspector */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-slate-900">
              <div className="space-y-6">
                {/* Composite Risk Score Meter with Segmented Progress Bar */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Risk Evaluation</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white font-display">{currentDoc.riskLevel}</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xs">
                      Score {currentDoc.riskScore}/100
                    </span>
                  </div>
                  <SegmentedProgressBar
                    score={currentDoc.riskScore}
                    max={100}
                    segments={8}
                    color={currentDoc.riskScore > 60 ? 'amber' : 'emerald'}
                    scoreBadgeFormat={(v) => `${Math.round(v)}%`}
                    size="sm"
                  />
                </div>

                {/* Selected Field Inspector Details */}
                {(() => {
                  const activeField = currentDoc.fields.find((f) => f.id === selectedFieldId) || currentDoc.fields[0];
                  return (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeField.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                          <span className="font-display">Extracted Property</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono font-bold">
                            Confidence {(activeField.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">{activeField.name}</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white font-display">{activeField.value}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                          <span className="font-bold text-blue-600 dark:text-blue-400">Audit Citation:</span> {activeField.note}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  );
                })()}

                {/* Anomalies Detected Block */}
                {currentDoc.anomalies.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5 font-mono">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Detected Discrepancies ({currentDoc.anomalies.length})
                    </p>
                    {currentDoc.anomalies.map((ano, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-xs text-red-800 dark:text-red-200">
                        <p className="font-bold font-display">{ano.type}</p>
                        <p className="text-[11px] text-red-700 dark:text-red-300 mt-0.5">{ano.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Obligations & Tasks */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                    <CheckSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Actionable Obligations
                  </p>
                  {currentDoc.obligations.map((ob, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-white flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{ob.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Assigned: {ob.assignedTo}</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                        Due {ob.due}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                <Link
                  to="/login"
                  className="shimmer-btn w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Open Full Document in Studio</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 3. Four Core Enterprise Problems DocuTrace Solves ────────────────── */}
      <section className="py-24 border-b border-slate-200/80 dark:border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              Operational Challenges Solved
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-2 font-display">
              Built for Teams that Cannot Afford Unverified Figures
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
              Manual document review is slow, error-prone, and disconnected from workflow systems. DocuTrace provides automated verification with zero black-box claims.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Problem 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card-interactive p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Buried Deadlines & Rollovers
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Notice periods, warranty expirations, and automatic contract rollovers buried in dense paragraphs lead to unwanted multi-year financial commitments.
              </p>
            </motion.div>

            {/* Problem 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card-interactive p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <GitCompare className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Cross-Document Mismatches
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Invoices often deviate from approved Purchase Order quantities or contracted Master Agreement rate cards, resulting in undetected vendor price creep.
              </p>
            </motion.div>

            {/* Problem 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card-interactive p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Hash className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Math Errors & Duplicate Invoices
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tax miscalculations, line-item arithmetic discrepancies, and identical invoices billed under different dates slip past manual sampling.
              </p>
            </motion.div>

            {/* Problem 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card-interactive p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Audit Trail Failure
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard OCR and black-box AI tools output plain numbers without verifiable evidence, making compliance audit verification impossible.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. Evidence-Grounded Extraction Architecture ───────────────────── */}
      <section id="evidence-grounding" className="py-24 bg-slate-100/70 dark:bg-[#0E131F] border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                Evidence-Grounded Extraction
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-2 font-display">
                Every Extraction Linked to Spatial Pixel Coordinates
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                DocuTrace never outputs an ungrounded claim. Every monetary value, execution date, indemnity clause, and vendor identity maps directly to a coordinate bounding box <code className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-slate-800 text-[11px] font-mono text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700">[x0, y0, x1, y1]</code> on the rendered page.
              </p>

              <div className="mt-8 space-y-3.5">
                <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-display">Deterministic Layout OCR</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Preserves tabular structures, nested columns, and invoice header hierarchies.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-display">Confidence Scoring per Field</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ratings from 0.00 to 1.00 highlight low-certainty items for human-in-the-loop review.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-display">Auditable Field Correction</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Auditors can adjust extracted figures with full user and timestamp version history.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Architecture Visual Telemetry Box */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
              className="space-y-5"
            >
              <TelemetryCard
                metric="0.42s"
                metricLabel="Spatial OCR Ingestion Latency"
                timestamp="12.09.2026 12:00 AM"
                badge={{
                  text: "pipeline-v2.8-ocr",
                  count: "900K events",
                  arrow: true,
                }}
                subStats={[
                  { label: "Median", value: "0.16s", diff: "-100%", isPositive: true },
                  { label: "Min", value: "0.06s", diff: "+45%", isPositive: false },
                  { label: "Max", value: "0.61s", diff: "-69%", isPositive: true },
                ]}
                footer="First seen: 01.09.2026 1:22 AM"
                size="xl"
              />

              <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">EXTRACTION_COORDINATES.json</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> SHA-256 Verified
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5 overflow-x-auto border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 dark:text-slate-500">{`// Spatial Bounding Box Mapping`}</p>
                  <p>{`"field_name": "total_amount", "field_value": "$142,500.00",`}</p>
                  <p>{`"confidence_score": 0.994, "page_number": 1,`}</p>
                  <p className="text-blue-600 dark:text-blue-400 font-bold">{`"bbox": [58.2, 220.4, 180.1, 245.8]`}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. Cross-Document 3-Way Reconciliation Engine ───────────────────── */}
      <section id="three-way-match" className="py-24 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              Automated Discrepancy Matching
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-2 font-display">
              3-Way Reconciliation: Invoice ↔ Purchase Order ↔ Contract
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
              DocuTrace clusters multi-document transaction sets to detect rate-card discrepancies, unapproved price inflation, and mismatched terms before finance release.
            </p>
          </motion.div>

          {/* Visual 3-Way Match Table Simulation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-x-auto"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider font-mono">
                  <th className="p-4 sm:p-5">Reconciliation Field</th>
                  <th className="p-4 sm:p-5">Commercial Invoice</th>
                  <th className="p-4 sm:p-5">Purchase Order</th>
                  <th className="p-4 sm:p-5">Master Contract</th>
                  <th className="p-4 sm:p-5 text-right">Match Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white font-display">Vendor Entity Name</td>
                  <td className="p-4 sm:p-5">Acme Cloud Solutions Inc.</td>
                  <td className="p-4 sm:p-5">Acme Cloud Solutions Inc.</td>
                  <td className="p-4 sm:p-5">Acme Cloud Solutions Inc.</td>
                  <td className="p-4 sm:p-5 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-bold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> 100% Match
                    </span>
                  </td>
                </tr>
                <tr className="bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50/60 dark:hover:bg-red-950/30 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-red-900 dark:text-red-200 font-display">License Unit Rate</td>
                  <td className="p-4 sm:p-5 font-bold text-red-600 dark:text-red-400 font-mono">$2,850.00 / seat</td>
                  <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400 font-mono">$2,720.00 / seat</td>
                  <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400 font-mono">$2,720.00 / seat</td>
                  <td className="p-4 sm:p-5 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40 font-bold text-[11px]">
                      <XCircle className="h-3.5 w-3.5" /> +$130 Rate Variance
                    </span>
                  </td>
                </tr>
                <tr className="bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-amber-900 dark:text-amber-200 font-display">Payment Terms</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-600 dark:text-amber-400 font-mono">Net 30 Days</td>
                  <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400 font-mono">Net 60 Days</td>
                  <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400 font-mono">Net 60 Days</td>
                  <td className="p-4 sm:p-5 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 font-bold text-[11px]">
                      <AlertTriangle className="h-3.5 w-3.5" /> Term Conflict
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white font-display">Authorized Quantity</td>
                  <td className="p-4 sm:p-5 font-mono">50 Compute Licenses</td>
                  <td className="p-4 sm:p-5 font-mono">50 Compute Licenses</td>
                  <td className="p-4 sm:p-5 font-mono">Up to 100 Licenses</td>
                  <td className="p-4 sm:p-5 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-bold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ── 6. Anomaly Detection & Statistical Risk Engine ─────────────────── */}
      <section id="anomalies-risk" className="py-24 bg-slate-100/70 dark:bg-[#0E131F] border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              Statistical & Formulaic Auditing
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-2 font-display">
              Multi-Layer Anomaly & Risk Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
              Combining deterministic math formulas with unsupervised machine learning to detect statistical anomalies across corporate spending records.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Layer 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card-interactive p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center font-bold text-base font-mono">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Formula & Math Validation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Deterministic recalculation of all subtotals, tax rates, discounts, and line-item sums. Flags math discrepancies immediately.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                Formula check: <span className="text-emerald-600 dark:text-emerald-400 font-bold">∑(Qty × Rate) + Tax = Total ✓</span>
              </div>
            </motion.div>

            {/* Layer 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card-interactive p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center font-bold text-base font-mono">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                IsolationForest Outlier Model
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Unsupervised outlier analysis detects unusual billing spikes, irregular currency conversions, and rate anomalies compared to historical vendor baseline.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                Outlier threshold: <span className="text-amber-600 dark:text-amber-400 font-bold">Score &gt; 0.65 flags review</span>
              </div>
            </motion.div>

            {/* Layer 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card-interactive p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center font-bold text-base font-mono">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Duplicate & Hash Cross-Check
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                SHA-256 fingerprinting and composite key matching prevent duplicate invoice submissions across departments and fiscal quarters.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                Index: <span className="text-slate-900 dark:text-white font-bold">Vendor + Inv# + Exact Amount</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 7. Obligation-to-Action Workflow Engine ─────────────────────────── */}
      <section className="py-24 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Workflow Steps */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
              className="space-y-4"
            >
              <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-4 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Contract Clause Ingestion</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    DocuTrace scans agreement clauses for temporal commitments, notice periods, and payment milestones.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-4 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Automated Task Generation</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Extracted dates convert into assignable tasks with due dates, priority ratings, and source clause links.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-4 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">Kanban & Role Assignment</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Track status across Todo, In Progress, Review, and Done with auditor completion audit trails.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                Obligations & Action Engine
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-2 font-display">
                From Static Legal Text to Executable Action Items
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                Never lose track of a commercial renewal window or compliance filing. DocuTrace converts unstructured contractual text into prioritized, trackable action tasks assigned to your operations and finance teams.
              </p>

              <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
                <Link
                  to="/login"
                  className="shimmer-btn px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all inline-flex items-center gap-2 group"
                >
                  <span>Explore Action Engine</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 8. Security, Data Governance & Compliance ───────────────────────── */}
      <section id="security" className="py-24 bg-slate-100/70 dark:bg-[#0E131F] border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              Enterprise Security & Architecture
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-2 font-display">
              Zero Data Leakage • Strict Tenant Isolation
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
              DocuTrace is engineered for corporate compliance, financial auditability, and absolute data security.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card-interactive p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">AES-256-GCM Field Encryption</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Sensitive financial quantities, vendor tax IDs, and confidential clauses are encrypted at the field level.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card-interactive p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Isolated Tenant Storage</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Document files and vector embeddings reside in strict user-isolated storage partitions with zero cross-tenant access.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card-interactive p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Magic Byte File Validation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Strict binary header inspection blocks spoofed file types before disk write, preventing upload vulnerabilities.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card-interactive p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">SOC 2 & GDPR Aligned</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Full user-controlled audit logs, immutable SHA-256 timestamps, and granular data deletion support.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 9. Final Actionable CTA ────────────────────────────────────────── */}
      <section className="py-24 border-b border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden bg-white dark:bg-[#0B0F17]">
        <div className="absolute inset-0 bg-tech-grid opacity-50 dark:opacity-25 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/15 dark:bg-blue-600/15 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6"
        >
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-display leading-tight">
            Ready to Verify Your Document Intelligence?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Access the DocuTrace platform to run 3-way reconciliation, detect financial anomalies, and extract traceable obligations today.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="shimmer-btn w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
            >
              Sign In to Platform
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm shadow-xs hover:-translate-y-0.5 transition-all"
            >
              Create Organization Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 10. Enterprise Footer ─────────────────────────────────────────── */}
      <footer className="py-12 bg-white dark:bg-[#0B0F17] text-slate-500 dark:text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span>• Verified Document Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link to="/login" className="hover:text-blue-600 dark:hover:text-white transition">Sign In</Link>
            <Link to="/register" className="hover:text-blue-600 dark:hover:text-white transition">Register</Link>
            <span className="text-slate-400 dark:text-slate-500 font-mono">© {new Date().getFullYear()} DocuTrace Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
