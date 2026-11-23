import React from 'react';
import { Modal } from '../common/Modal';
import { PropertyMatchScore } from '../../services/propertyMatchingService';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info
} from 'lucide-react';

interface MatchExplanationModalProps {
  matchScore: PropertyMatchScore | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchExplanationModal: React.FC<MatchExplanationModalProps> = ({
  matchScore,
  isOpen,
  onClose,
}) => {
  if (!matchScore) return null;

  const { property, totalScore, matchedCount, totalCriteriaCount, scoreFormulaDisclosure, matchingCriteria, explanation } = matchScore;

  const confirmedCriteria = matchingCriteria.filter(c => c.status === 'confirmed');
  const unconfirmedCriteria = matchingCriteria.filter(c => c.status === 'unavailable' || c.status === 'revalidation_required');
  const dealbreakerCriteria = matchingCriteria.filter(c => c.status === 'does_not_match');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Explainable AI Match Breakdown"
      subtitle={`${property.name} (${property.id}) • Match Index Analysis`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        
        {/* Score Card Header */}
        <div className="bg-gradient-to-br from-[#1E1B4B] to-[#2E1065] text-white rounded-2xl p-5 border border-indigo-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#694CFF] text-white flex flex-col items-center justify-center font-black shadow-lg shadow-[#694CFF]/40 shrink-0">
              <span className="text-xl leading-none">{totalScore}%</span>
              <span className="text-[9px] uppercase tracking-wider text-indigo-200 mt-0.5">Match</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-base">{property.name}</h4>
                <span className="bg-indigo-700/80 text-indigo-100 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {property.categoryLabel}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                {explanation.summary}
              </p>
            </div>
          </div>

          <div className="flex flex-col text-xs text-indigo-200 border-t sm:border-t-0 sm:border-l border-indigo-800/80 pt-3 sm:pt-0 sm:pl-4">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="text-gray-400">Verified Matches:</span>
              <strong className="text-emerald-400">{matchedCount} / {totalCriteriaCount}</strong>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-3 mt-1">
              <span className="text-gray-400">Starting Rent:</span>
              <strong className="text-white">₹{property.pricing.startingRent.toLocaleString('en-IN')}/mo</strong>
            </div>
          </div>
        </div>

        {/* Formula Transparency Disclosure Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">
              Scoring Methodology & Trust Disclosure
            </p>
            <p className="text-[11.5px] leading-relaxed">
              {scoreFormulaDisclosure} Explicitly stated user preferences are weighted at <strong>3.0x</strong>; AI-inferred requirements at <strong>1.5x</strong>. Missing or outdated records receive <strong>0 points</strong>. This score represents requirement alignment, NOT a physical safety guarantee.
            </p>
          </div>
        </div>

        {/* Criteria Breakdown Groups */}
        <div className="space-y-5">
          
          {/* 1. Confirmed Matches (Pros) */}
          {confirmedCriteria.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Confirmed Requirements ({confirmedCriteria.length})</span>
              </div>
              <div className="space-y-2">
                {confirmedCriteria.map((item, idx) => (
                  <div key={idx} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <span>{item.criterion}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                          {item.weight === 3 ? 'Explicit (3x)' : 'Inferred (1.5x)'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-[11.5px]">{item.reason}</p>
                    </div>
                    <span className="shrink-0 bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      ✓ Confirmed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Unconfirmed / Pending Revalidation */}
          {unconfirmedCriteria.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 mb-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Unconfirmed or Aging Evidence ({unconfirmedCriteria.length}) — No Points Awarded</span>
              </div>
              <div className="space-y-2">
                {unconfirmedCriteria.map((item, idx) => (
                  <div key={idx} className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <span>{item.criterion}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                          Weight: {item.weight}x (0 earned)
                        </span>
                      </div>
                      <p className="text-amber-900 text-[11.5px]">{item.reason}</p>
                    </div>
                    <span className="shrink-0 bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      ⚠ Unverified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Dealbreakers / Mismatches */}
          {dealbreakerCriteria.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-800 mb-2.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Mismatches with Stated Criteria ({dealbreakerCriteria.length})</span>
              </div>
              <div className="space-y-2">
                {dealbreakerCriteria.map((item, idx) => (
                  <div key={idx} className="bg-rose-50/60 border border-rose-200 rounded-xl p-3 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <span>{item.criterion}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded">
                          Mismatch
                        </span>
                      </div>
                      <p className="text-rose-900 text-[11.5px]">{item.reason}</p>
                    </div>
                    <span className="shrink-0 bg-rose-100 text-rose-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      ✗ Does Not Match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
          <span className="font-mono text-[11px]">Listing: {property.id}</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#694CFF] hover:underline cursor-pointer"
          >
            Close Explanation
          </button>
        </div>

      </div>
    </Modal>
  );
};
