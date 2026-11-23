import React from 'react';
import { ShieldCheck, Heart, MapPin, Sparkles, AlertTriangle } from 'lucide-react';
import { scrollToSection } from '../../utils/scrollUtils';

export const Footer: React.FC = () => {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    scrollToSection(targetId, 84);
  };
  return (
    <footer className="bg-[#111827] text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#694CFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-[#694CFF]/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white">
                  Trust<span className="text-[#A78BFA]">Nest</span>
                </span>
                <span className="text-xs text-gray-400">
                  Find your place. Know your place. Feel confident.
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              An AI-powered, human-supported accommodation & city intelligence platform. Bridging intelligent requirement parsing with boots-on-the-ground physical inspections and verified public facilities.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-xs text-gray-300">
              <MapPin className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Pilot Location: <strong>Hyderabad</strong> (HITEC City & Madhapur)</span>
            </div>
          </div>

          {/* Quick Links: Stays */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Find Stay</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#properties-section" onClick={(e) => handleScrollTo(e, 'properties-section')} className="hover:text-white transition-colors cursor-pointer">Women’s Executive PGs</a></li>
              <li><a href="#properties-section" onClick={(e) => handleScrollTo(e, 'properties-section')} className="hover:text-white transition-colors cursor-pointer">Men’s PGs & Hostels</a></li>
              <li><a href="#properties-section" onClick={(e) => handleScrollTo(e, 'properties-section')} className="hover:text-white transition-colors cursor-pointer">Co-living Studios</a></li>
              <li><a href="#properties-section" onClick={(e) => handleScrollTo(e, 'properties-section')} className="hover:text-white transition-colors cursor-pointer">Student Stays</a></li>
              <li><a href="#hero" onClick={(e) => handleScrollTo(e, 'hero')} className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"><Sparkles className="w-3 h-3 text-[#A78BFA]" /> AI Search Tool</a></li>
            </ul>
          </div>

          {/* City Intelligence & Community */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Civic & Community</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#city-intelligence-section" onClick={(e) => handleScrollTo(e, 'city-intelligence-section')} className="hover:text-white transition-colors cursor-pointer">Hospitals & Trauma Care</a></li>
              <li><a href="#city-intelligence-section" onClick={(e) => handleScrollTo(e, 'city-intelligence-section')} className="hover:text-white transition-colors cursor-pointer">Police & SHE Teams</a></li>
              <li><a href="#city-intelligence-section" onClick={(e) => handleScrollTo(e, 'city-intelligence-section')} className="hover:text-white transition-colors cursor-pointer">Blue Line Metro Transit</a></li>
              <li><a href="#community-section" onClick={(e) => handleScrollTo(e, 'community-section')} className="hover:text-white transition-colors cursor-pointer">Community Observations</a></li>
              <li><a href="#contribute-section" onClick={(e) => handleScrollTo(e, 'contribute-section')} className="hover:text-white transition-colors cursor-pointer">Contribute & Earn</a></li>
            </ul>
          </div>

          {/* Trust, Governance & Verification */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Trust & Verification</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#verification-section" onClick={(e) => handleScrollTo(e, 'verification-section')} className="hover:text-white transition-colors cursor-pointer">Human + AI Framework</a></li>
              <li><a href="#verification-section" onClick={(e) => handleScrollTo(e, 'verification-section')} className="hover:text-white transition-colors cursor-pointer">Evidence Timelines</a></li>
              <li><a href="#safety-section" onClick={(e) => handleScrollTo(e, 'safety-section')} className="hover:text-white transition-colors cursor-pointer">Reviewer Anonymity</a></li>
              <li><a href="#safety-section" onClick={(e) => handleScrollTo(e, 'safety-section')} className="hover:text-white transition-colors cursor-pointer">Information Freshness Policy</a></li>
              <li><a href="#owners-section" onClick={(e) => handleScrollTo(e, 'owners-section')} className="hover:text-white transition-colors cursor-pointer">Property Owner Portal</a></li>
            </ul>
          </div>

        </div>

        {/* Emergency Disclaimer & Hackathon Badge */}
        <div className="mt-8 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2 max-w-2xl bg-gray-900/80 p-3 rounded-xl border border-gray-800 text-gray-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Emergency Notice:</strong> TrustNest provides civic intelligence and verified accommodation data. In immediate danger or medical emergencies, dial <strong>112 / 100</strong> immediately. Emergency functions in this MVP are simulated demonstration interfaces.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-gray-400">
              Autonomous Civic Intelligence Platform
            </span>
            <span className="hidden sm:inline text-gray-700">•</span>
            <span className="text-gray-500 text-[11px]">
              IDEA//FORGE 2026 Project Submission
            </span>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="mt-8 pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© 2026 TrustNest Platform. All demonstration listings explicitly marked as DEMO DATA.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for confident city relocation
          </p>
        </div>
      </div>
    </footer>
  );
};
