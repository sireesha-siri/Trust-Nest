import React, { useState, useMemo } from 'react';
import { Property, AccommodationCategory } from '../../types/property';
import { PropertyCard } from '../property/PropertyCard';
import { PropertyDetailModal } from '../property/PropertyDetailModal';
import { PropertyComparisonBar } from '../property/PropertyComparisonBar';
import { PropertyComparisonModal } from '../property/PropertyComparisonModal';
import { PropertyMatchingService, PropertyMatchScore } from '../../services/propertyMatchingService';
import { StructuredAccommodationRequirements, ChecklistItem } from '../../types/aiSearch';
import { 
  AlertCircle, 
  Scale, 
  ArrowUpDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { scrollToSection } from '../../utils/scrollUtils';

interface FeaturedPropertiesProps {
  properties: Property[];
  selectedCategory: AccommodationCategory | 'all';
  activeChecklist?: ChecklistItem[];
  structuredRequirements?: StructuredAccommodationRequirements;
  onResetFilter?: () => void;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  selectedCategory,
  activeChecklist,
  structuredRequirements,
  onResetFilter,
}) => {
  const { showToast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'womens' | 'near_metro' | 'high_trust' | 'fresh'>('all');
  const [sortBy, setSortBy] = useState<'match' | 'price_asc' | 'price_desc' | 'trust_desc' | 'metro_asc'>('match');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleResetAllFilters = () => {
    setActiveTabFilter('all');
    setSortBy('match');
    if (onResetFilter) {
      onResetFilter();
    }
    showToast('Filters reset. Showing all verified stays.', 'info');
  };

  // Calculate intelligent match scores across properties
  const matchScores = useMemo(() => {
    return PropertyMatchingService.evaluateAll(properties, structuredRequirements, activeChecklist);
  }, [properties, structuredRequirements, activeChecklist]);

  const matchScoreMap = useMemo(() => {
    return new Map<string, PropertyMatchScore>(matchScores.map(m => [m.propertyId, m]));
  }, [matchScores]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // First check category if selected from category cards
      if (selectedCategory !== 'all' && prop.category !== selectedCategory) {
        return false;
      }

      // Check tab filter
      if (activeTabFilter === 'womens') {
        return prop.category === 'womens_pg';
      }
      if (activeTabFilter === 'near_metro') {
        return prop.location.distanceToNearestMetroKm <= 1.0;
      }
      if (activeTabFilter === 'high_trust') {
        return prop.verification.overallTrustScore >= 92;
      }
      if (activeTabFilter === 'fresh') {
        return !prop.verification.statusSummary.freshnessWarning;
      }

      return true;
    });
  }, [properties, selectedCategory, activeTabFilter]);

  // Sort properties
  const sortedAndFilteredProperties = useMemo(() => {
    const sorted = [...filteredProperties];
    switch (sortBy) {
      case 'match':
        return sorted.sort((a, b) => {
          const scoreA = matchScoreMap.get(a.id)?.totalScore || 0;
          const scoreB = matchScoreMap.get(b.id)?.totalScore || 0;
          return scoreB - scoreA;
        });
      case 'price_asc':
        return sorted.sort((a, b) => a.pricing.startingRent - b.pricing.startingRent);
      case 'price_desc':
        return sorted.sort((a, b) => b.pricing.startingRent - a.pricing.startingRent);
      case 'trust_desc':
        return sorted.sort((a, b) => b.verification.overallTrustScore - a.verification.overallTrustScore);
      case 'metro_asc':
        return sorted.sort((a, b) => a.location.distanceToNearestMetroKm - b.location.distanceToNearestMetroKm);
      default:
        return sorted;
    }
  }, [filteredProperties, sortBy, matchScoreMap]);

  // Comparison toggle handling (max 3)
  const handleToggleCompare = (property: Property) => {
    setSelectedForCompare(prev => {
      if (prev.includes(property.id)) {
        return prev.filter(id => id !== property.id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, property.id];
    });
  };

  const handleRemoveCompare = (id: string) => {
    setSelectedForCompare(prev => prev.filter(item => item !== id));
  };

  const handleClearCompare = () => {
    setSelectedForCompare([]);
  };

  const selectedCompareProperties = useMemo(() => {
    return properties.filter(p => selectedForCompare.includes(p.id));
  }, [properties, selectedForCompare]);

  return (
    <section id="properties-section" className="py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#694CFF] bg-[#F3F0FF] px-3 py-1 rounded-full border border-[#694CFF]/20">
                Grounded Listings
              </span>
              <span className="text-[11px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                DEMO DATA
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              Verified Properties in HITEC City & Madhapur
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Every card shows granular timestamps for rent, availability, room condition and fire safety. Compare up to 3 listings side-by-side.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
                aria-label="Sort properties"
              >
                <option value="match">AI Match Score</option>
                <option value="price_asc">Rent: Low to High</option>
                <option value="price_desc">Rent: High to Low</option>
                <option value="trust_desc">Trust & Audit Score</option>
                <option value="metro_asc">Nearest Metro</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-900">{sortedAndFilteredProperties.length}</span>
              <span>Properties matched</span>
            </div>

            {onResetFilter && properties.length < 6 && (
              <button
                onClick={onResetFilter}
                className="text-xs font-semibold text-[#694CFF] bg-[#F3F0FF] hover:bg-[#EBE5FF] px-3 py-2 rounded-xl border border-[#694CFF]/20 cursor-pointer transition-colors"
              >
                Reset Search (Show All 6)
              </button>
            )}
          </div>
        </div>

        {/* Contextual AI Requirements Matching Banner */}
        {activeChecklist && activeChecklist.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 rounded-2xl border border-[#694CFF]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#694CFF] text-white flex items-center justify-center shrink-0 shadow-xs shadow-[#694CFF]/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                  <span>AI Criteria Matching Active</span>
                  <span className="bg-[#694CFF] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    {sortedAndFilteredProperties.length} of {properties.length} match
                  </span>
                </div>
                <p className="text-[11.5px] text-gray-600 mt-0.5">
                  Showing accommodation ranked by match score for your {activeChecklist.filter(c => c.checked).length} active requirements.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => scrollToSection('ai-checklist-container', 90)}
                className="text-xs font-semibold text-[#694CFF] hover:text-[#573BD6] bg-white px-3 py-1.5 rounded-xl border border-indigo-200 cursor-pointer transition-colors shadow-2xs hover:bg-[#F3F0FF]"
              >
                Modify Criteria ↑
              </button>
              {onResetFilter && (
                <button
                  type="button"
                  onClick={onResetFilter}
                  className="text-xs font-medium text-gray-500 hover:text-gray-800 bg-white px-3 py-1.5 rounded-xl border border-gray-200 cursor-pointer transition-colors"
                >
                  Clear AI Filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 border-b border-gray-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTabFilter === 'all'
                  ? 'bg-[#694CFF] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Listings ({properties.length})
            </button>

            <button
              onClick={() => setActiveTabFilter('womens')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTabFilter === 'womens'
                  ? 'bg-[#694CFF] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Women's Only Stays
            </button>

            <button
              onClick={() => setActiveTabFilter('near_metro')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTabFilter === 'near_metro'
                  ? 'bg-[#694CFF] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Walking to Metro (≤ 1 km)
            </button>

            <button
              onClick={() => setActiveTabFilter('high_trust')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTabFilter === 'high_trust'
                  ? 'bg-[#694CFF] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Trust Score 92%+
            </button>

            <button
              onClick={() => setActiveTabFilter('fresh')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTabFilter === 'fresh'
                  ? 'bg-[#694CFF] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Fresh Evidence Only
            </button>
          </div>

          {/* Quick Comparison Counter helper */}
          {selectedForCompare.length > 0 && (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="text-xs font-bold text-[#694CFF] bg-[#F3F0FF] hover:bg-[#EBE5FF] px-3 py-1.5 rounded-xl border border-[#694CFF]/20 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Selected ({selectedForCompare.length})</span>
            </button>
          )}
        </div>

        {/* Properties Grid */}
        {sortedAndFilteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={(prop) => setSelectedProperty(prop)}
                isChecklistMatch={activeChecklist && activeChecklist.length > 0}
                matchScore={matchScoreMap.get(property.id)}
                isSelectedForCompare={selectedForCompare.includes(property.id)}
                onToggleCompare={handleToggleCompare}
                canSelectForCompare={selectedForCompare.length < 3 || selectedForCompare.includes(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 p-10 sm:p-14 text-center max-w-lg mx-auto space-y-4 shadow-sm animate-in fade-in duration-200">
            <div className="w-14 h-14 bg-purple-50 text-[#694CFF] rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">No properties match your current filters</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                We couldn't find any listings matching all of your active criteria. Try broadening your budget, category, or tab filters.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={handleResetAllFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="shadow-sm shadow-[#694CFF]/20"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* Floating Property Comparison Docked Bar */}
      <PropertyComparisonBar
        selectedProperties={selectedCompareProperties}
        onRemove={handleRemoveCompare}
        onClear={handleClearCompare}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
      />

      {/* Side-by-side Evidence Comparison Modal */}
      <PropertyComparisonModal
        properties={selectedCompareProperties}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveProperty={handleRemoveCompare}
        onViewDetails={(prop) => {
          setIsCompareModalOpen(false);
          setSelectedProperty(prop);
        }}
      />

      {/* Property Details Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={Boolean(selectedProperty)}
        onClose={() => setSelectedProperty(null)}
      />
    </section>
  );
};
