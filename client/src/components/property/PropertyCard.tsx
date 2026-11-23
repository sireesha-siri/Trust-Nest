import React, { useState } from 'react';
import { 
  Property, 
  PhotoSource 
} from '../../types/property';
import { PropertyMatchScore } from '../../services/propertyMatchingService';
import { MatchExplanationModal } from './MatchExplanationModal';
import { 
  MapPin, 
  Train, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Scale,
  Sparkles,
  Info,
  Bookmark
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  isChecklistMatch?: boolean;
  matchScore?: PropertyMatchScore;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (property: Property) => void;
  canSelectForCompare?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  isChecklistMatch = false,
  matchScore,
  isSelectedForCompare = false,
  onToggleCompare,
  canSelectForCompare = true,
}) => {
  const { showToast } = useToast();
  const [isSaved, setIsSaved] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('trustnest_saved_stays');
        if (saved) {
          const list = JSON.parse(saved);
          return Array.isArray(list) && list.includes(property.id);
        }
      }
    } catch {
      // fallback
    }
    return false;
  });

  // Toggle between available photo streams: Field Researcher vs Owner vs Community
  const [activePhotoStream, setActivePhotoStream] = useState<PhotoSource>(
    property.photos.fieldResearcher.length > 0 ? 'field_researcher' : 'owner'
  );
  const [showMatchModal, setShowMatchModal] = useState(false);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('trustnest_saved_stays');
        const list = saved ? JSON.parse(saved) : [];
        const updated = nextSaved
          ? Array.from(new Set([...list, property.id]))
          : list.filter((id: string) => id !== property.id);
        localStorage.setItem('trustnest_saved_stays', JSON.stringify(updated));
      }
    } catch {
      // fallback
    }

    showToast(
      nextSaved ? `Saved "${property.name}" to your guest shortlist` : `Removed "${property.name}" from saved stays`,
      nextSaved ? 'success' : 'info'
    );
  };

  const handleCompareClick = () => {
    if (!onToggleCompare) return;
    if (!isSelectedForCompare && !canSelectForCompare) {
      showToast('Maximum 3 properties can be compared at once', 'warning');
      return;
    }
    onToggleCompare(property);
    showToast(
      isSelectedForCompare
        ? `Removed "${property.name}" from comparison`
        : `Added "${property.name}" to comparison matrix (${isSelectedForCompare ? '2' : '3'}/3)`,
      isSelectedForCompare ? 'info' : 'success'
    );
  };

  const currentPhotos = 
    activePhotoStream === 'field_researcher' 
      ? property.photos.fieldResearcher 
      : activePhotoStream === 'owner' 
      ? property.photos.owner 
      : property.photos.community;

  const currentPhoto = currentPhotos[0] || property.photos.owner[0] || {
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    caption: 'Property visual',
    source: 'owner' as PhotoSource,
    uploadedAt: '2026-11-01',
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'womens_pg':
        return 'bg-purple-100 text-[#694CFF] border-purple-200';
      case 'mens_pg':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'coliving':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'studio_apartment':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <article className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${
        isSelectedForCompare 
          ? 'border-[#694CFF] shadow-[0_8px_30px_rgba(105,76,255,0.22)] ring-2 ring-[#694CFF]/30'
          : 'border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(105,76,255,0.14)] hover:border-[#694CFF]/30'
      }`}>
        
        {/* Top Media Container */}
        <div className="relative h-56 w-full overflow-hidden bg-gray-100">
          <img
            src={currentPhoto.url}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Top Badges Row */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span className="bg-amber-400 text-gray-900 font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded shadow-sm uppercase">
                DEMO DATA
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${getCategoryTheme(property.category)}`}>
                {property.categoryLabel}
              </span>
            </div>

            {/* Compare Checkbox Button & Audit Pill */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {/* Bookmark Save Button */}
              <button
                type="button"
                onClick={handleToggleSave}
                className={`p-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/30'
                    : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save property to shortlist'}
                aria-label={isSaved ? `Unsave ${property.name}` : `Save ${property.name}`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
              </button>

              {onToggleCompare && (
                <button
                  type="button"
                  onClick={handleCompareClick}
                  data-testid={`compare-btn-${property.id}`}
                  disabled={!isSelectedForCompare && !canSelectForCompare}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                    isSelectedForCompare
                      ? 'bg-[#694CFF] text-white border-[#694CFF] shadow-md shadow-[#694CFF]/40 ring-1 ring-white/50'
                      : !canSelectForCompare
                      ? 'bg-black/40 text-gray-400 border-white/10 opacity-60 cursor-not-allowed'
                      : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
                  }`}
                  title={
                    !isSelectedForCompare && !canSelectForCompare 
                      ? 'Maximum 3 properties can be compared at once' 
                      : isSelectedForCompare 
                      ? 'Remove from comparison' 
                      : 'Add to side-by-side comparison'
                  }
                  aria-label={`Compare ${property.name}`}
                >
                  <Scale className="w-3 h-3" />
                  <span>{isSelectedForCompare ? 'Selected' : 'Compare'}</span>
                </button>
              )}

              {/* Trust Score Pill */}
              <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md border border-white/50 text-xs font-bold text-gray-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{property.verification.overallTrustScore}%</span>
              </div>
            </div>
          </div>

          {/* Photo Stream Source Switcher Tabs */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/20 text-[10.5px]">
              {property.photos.fieldResearcher.length > 0 && (
                <button
                  onClick={() => setActivePhotoStream('field_researcher')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    activePhotoStream === 'field_researcher'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  title="Photographs taken by TrustNest field researcher"
                >
                  Field ({property.photos.fieldResearcher.length})
                </button>
              )}

              {property.photos.owner.length > 0 && (
                <button
                  onClick={() => setActivePhotoStream('owner')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    activePhotoStream === 'owner'
                      ? 'bg-[#694CFF] text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  title="Photographs provided by property owner"
                >
                  Owner ({property.photos.owner.length})
                </button>
              )}

              {property.photos.community.length > 0 && (
                <button
                  onClick={() => setActivePhotoStream('community')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    activePhotoStream === 'community'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  title="Photographs submitted by community residents"
                >
                  Community ({property.photos.community.length})
                </button>
              )}
            </div>

            <span className="text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm font-mono">
              {currentPhoto.uploadedAt}
            </span>
          </div>
        </div>

        {/* Main Card Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          
          {/* Title, Match Badge, and Location */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-medium text-gray-400">
                  {property.id}
                </span>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#694CFF] transition-colors leading-snug">
                  {property.name}
                </h3>
              </div>

              {/* Explainable AI Match Score Badge */}
              {matchScore ? (
                <button
                  onClick={() => setShowMatchModal(true)}
                  className={`shrink-0 text-[10.5px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                    matchScore.totalScore >= 80
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : matchScore.totalScore >= 50
                      ? 'bg-indigo-50 text-[#694CFF] border-indigo-200 hover:bg-indigo-100'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                  title="Click to view explainable criteria breakdown and scoring formula"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{matchScore.totalScore}% Match</span>
                  <Info className="w-3 h-3 opacity-60 ml-0.5" />
                </button>
              ) : isChecklistMatch ? (
                <span className="shrink-0 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  AI Match
                </span>
              ) : null}
            </div>

            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {property.tagline}
            </p>

            {/* Micro-Location Info */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2.5 text-xs text-gray-600">
              <span className="flex items-center gap-1 text-gray-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#694CFF]" />
                {property.location.area}, Hyderabad
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1">
                <Train className="w-3.5 h-3.5 text-indigo-500" />
                {property.location.distanceToNearestMetroKm} km to {property.location.nearestMetroStation.split(' ')[0]} Metro
              </span>
            </div>
          </div>

          {/* Room Options & Vacancies */}
          <div className="bg-[#F8F7FF] rounded-xl p-3 border border-indigo-50/80 space-y-2">
            <div className="text-[11px] font-semibold text-gray-600 flex items-center justify-between">
              <span>Room Options & Vacancies</span>
              <span className="text-[10px] text-gray-400 font-mono">Refreshed {property.verification.timestamps.roomAvailability}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {property.roomOptions.slice(0, 2).map((room, idx) => (
                <div key={idx} className="bg-white p-2 rounded-lg border border-gray-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-gray-800 truncate">{room.type}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      room.availableBeds > 0 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {room.availableBeds > 0 ? `${room.availableBeds} Vacant` : 'Full'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#694CFF] mt-1">
                    ₹{room.rentPerMonth.toLocaleString('en-IN')}<span className="text-[10px] text-gray-500 font-normal">/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Evidence & Freshness Summary */}
          <div className="p-2.5 rounded-xl bg-gray-50/90 border border-gray-100 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Physical Field Verification
              </span>
              {property.verification.statusSummary.freshnessWarning ? (
                <span className="text-[10px] text-amber-700 font-medium flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Audit &gt;14d
                </span>
              ) : (
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Fresh Audit
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5 border-t border-gray-200/50">
              <span>Rent confirmed: {property.verification.timestamps.rentConfirmation}</span>
              <span className="font-medium text-gray-700">CCTV {property.verification.statusSummary.cctvAudited ? 'Audited' : 'Pending'}</span>
            </div>
          </div>

          {/* Bottom Price & Action Footer */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">
                Starts From
              </div>
              <div className="text-lg font-extrabold text-gray-900 leading-none">
                ₹{property.pricing.startingRent.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-gray-500">/mo</span>
              </div>
              {property.pricing.foodIncluded && (
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  ✓ 3 Meals Included
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onViewDetails(property)}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                className="shadow-sm shadow-[#694CFF]/20 font-semibold focus-visible:ring-2 focus-visible:ring-[#694CFF]"
              >
                View Evidence
              </Button>
            </div>
          </div>

        </div>
      </article>

      {/* Explainable AI Match Modal */}
      <MatchExplanationModal
        matchScore={matchScore || null}
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
      />
    </>
  );
};
