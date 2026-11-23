import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

export const DemoNoticeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Pilot notice" 
      className="relative w-full bg-[#1E1B4B] text-white text-[12px] py-2 px-4 border-b border-indigo-950/40 z-20"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <p className="truncate text-indigo-100 font-medium">
            <strong className="text-white">TrustNest Hyderabad Pilot</strong> | Demonstration listings are clearly labelled.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-300 text-[11px] font-medium bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Human + AI Verification Framework
          </span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-indigo-300 hover:text-white p-1 rounded transition-colors cursor-pointer"
            title="Dismiss notice"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
