import React from 'react';
import { ShieldCheck, UserCheck, Users, AlertCircle, Info, Sparkles } from 'lucide-react';

export type BadgeVariant = 
  | 'demo' 
  | 'field_verified' 
  | 'owner_claimed' 
  | 'community' 
  | 'warning' 
  | 'ai' 
  | 'neutral'
  | 'success';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  label,
  className = '',
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  switch (variant) {
    case 'demo':
      return (
        <span
          className={`inline-flex items-center font-bold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-700 border border-amber-300 ${sizeClass} ${className}`}
          title="Synthetic data used for demonstration purposes"
        >
          <Info className="w-3.5 h-3.5" />
          {label || 'DEMO DATA'}
        </span>
      );

    case 'field_verified':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClass} ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          {label || 'Field Verified'}
        </span>
      );

    case 'owner_claimed':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClass} ${className}`}
        >
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          {label || 'Owner Claimed'}
        </span>
      );

    case 'community':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClass} ${className}`}
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          {label || 'Community Reported'}
        </span>
      );

    case 'warning':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-md bg-orange-50 text-orange-700 border border-orange-200 ${sizeClass} ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
          {label || 'Re-check Pending'}
        </span>
      );

    case 'ai':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-md bg-[#694CFF]/10 text-[#694CFF] border border-[#694CFF]/20 ${sizeClass} ${className}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#694CFF]" />
          {label || 'AI Parsed'}
        </span>
      );

    case 'success':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-md bg-green-50 text-green-700 border border-green-200 ${sizeClass} ${className}`}
        >
          {label || 'Active'}
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-md bg-gray-100 text-gray-700 border border-gray-200 ${sizeClass} ${className}`}
        >
          {label}
        </span>
      );
  }
};
