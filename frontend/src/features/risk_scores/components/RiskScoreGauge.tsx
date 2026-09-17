import React from 'react';
import { RiskLevel } from '../../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';

interface RiskScoreGaugeProps {
  score: number; // 0 - 100
  level: RiskLevel;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ score, level }) => {
  const normScore = Math.min(Math.max(Math.round(score), 0), 100);

  const levelStyles = {
    low: {
      color: 'text-emerald-400',
      stroke: '#10B981',
      bgGlow: 'shadow-emerald-500/10',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      label: 'Low Risk — Clean Verification',
      icon: ShieldCheck,
    },
    medium: {
      color: 'text-amber-400',
      stroke: '#F59E0B',
      bgGlow: 'shadow-amber-500/10',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      label: 'Medium Risk — Review Needed',
      icon: AlertTriangle,
    },
    high: {
      color: 'text-orange-400',
      stroke: '#FB923C',
      bgGlow: 'shadow-orange-500/10',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      label: 'High Risk — Serious Discrepancies',
      icon: AlertOctagon,
    },
    critical: {
      color: 'text-red-400',
      stroke: '#EF4444',
      bgGlow: 'shadow-red-500/10',
      badge: 'bg-red-500/10 text-red-400 border-red-500/20',
      label: 'Critical Risk — Fraud / Severe Mismatch',
      icon: ShieldAlert,
    },
  };

  const style = levelStyles[level] || levelStyles.low;
  const Icon = style.icon;

  // SVG Gauge calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-900/60 rounded-2xl border border-gray-800 shadow-xl">
      <div className="relative flex items-center justify-center">
        {/* SVG Circular Gauge */}
        <svg className="w-36 h-36 transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="#1F2937"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={style.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold tracking-tight ${style.color}`}>
            {normScore}
          </span>
          <span className="text-[10px] uppercase font-bold text-gray-400">/ 100</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${style.badge}`}>
          <Icon className="h-3.5 w-3.5" />
          <span>{level} Risk</span>
        </div>
        <p className="mt-1.5 text-xs text-gray-400 font-medium">{style.label}</p>
      </div>
    </div>
  );
};
