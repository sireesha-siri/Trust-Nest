import React from 'react';
import { Clock, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export type FreshnessLevel = 'fresh' | 'aging' | 'recheck_needed' | 'missing';

interface EvidenceFreshnessBadgeProps {
  timestampText: string;
  isWarning?: boolean;
  className?: string;
  showIcon?: boolean;
}

export const EvidenceFreshnessBadge: React.FC<EvidenceFreshnessBadgeProps> = ({
  timestampText,
  isWarning = false,
  className = '',
  showIcon = true,
}) => {
  // Determine freshness
  let level: FreshnessLevel = 'fresh';
  let label = timestampText;

  if (isWarning || timestampText.toLowerCase().includes('re-check') || timestampText.toLowerCase().includes('pending')) {
    level = 'recheck_needed';
  } else if (timestampText.toLowerCase().includes('missing') || timestampText.toLowerCase().includes('unverified')) {
    level = 'missing';
  } else if (timestampText.includes('2026-10') || timestampText.includes('2026-09')) {
    level = 'aging';
  }

  const styles = {
    fresh: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    aging: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    recheck_needed: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    missing: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const icons = {
    fresh: <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />,
    aging: <Clock className="w-3 h-3 text-indigo-500 shrink-0" />,
    recheck_needed: <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />,
    missing: <HelpCircle className="w-3 h-3 text-gray-400 shrink-0" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-md border ${styles[level]} ${className}`}
      title={`Freshness status: ${level.replace('_', ' ')}`}
    >
      {showIcon && icons[level]}
      <span className="truncate">{label}</span>
    </span>
  );
};
