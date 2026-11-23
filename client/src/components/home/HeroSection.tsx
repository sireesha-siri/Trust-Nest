import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Lock
} from 'lucide-react';
import { AISearchExperience } from './AISearchExperience';
import { Property } from '../../types/property';
import { ChecklistItem, StructuredAccommodationRequirements } from '../../types/aiSearch';

interface HeroSectionProps {
  properties: Property[];
  onFilteredResults: (results: Property[], checklist: ChecklistItem[], structured?: StructuredAccommodationRequirements) => void;
  onClearFilter: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  properties,
  onFilteredResults,
  onClearFilter,
}) => {
  return (
    <section id="hero" className="relative pt-8 pb-16 overflow-hidden hero-gradient">
      {/* Background soft ambient orbs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#A78BFA]/20 via-[#694CFF]/15 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Hero Text */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          {/* Pilot Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#694CFF]/25 shadow-sm text-xs font-semibold text-gray-800">
            <span className="flex h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[#694CFF] font-bold">Hyderabad City Intelligence Pilot</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600">HITEC City & Madhapur</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]">
            Find your place. <br className="hidden sm:inline" />
            <span className="text-gradient">Know your place.</span> Feel confident.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover accommodation, understand your neighbourhood and make informed relocation decisions with <strong className="text-gray-900 font-semibold">AI-powered intelligence</strong> and <strong className="text-gray-900 font-semibold">human-verified information</strong>.
          </p>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs font-semibold text-gray-700">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Field Verification Architecture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#694CFF]" />
              <span>Natural-Language Search</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Reviewer Privacy Protected</span>
            </div>
          </div>
        </div>

        {/* Central AI Search Box Component */}
        <div className="max-w-5xl mx-auto">
          <AISearchExperience
            properties={properties}
            onFilteredResults={onFilteredResults}
            onClearFilter={onClearFilter}
          />
        </div>

      </div>
    </section>
  );
};
