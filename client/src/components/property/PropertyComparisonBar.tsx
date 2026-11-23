import React from 'react';
import { Property } from '../../types/property';
import { Button } from '../common/Button';
import { Scale, X, ArrowRight } from 'lucide-react';

interface PropertyComparisonBarProps {
  selectedProperties: Property[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenCompareModal: () => void;
}

export const PropertyComparisonBar: React.FC<PropertyComparisonBarProps> = ({
  selectedProperties,
  onRemove,
  onClear,
  onOpenCompareModal,
}) => {
  if (selectedProperties.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-auto z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#1E1B4B] text-white rounded-2xl shadow-2xl border border-indigo-700/60 p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-4 max-w-3xl">
        
        {/* Count and header */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="w-9 h-9 rounded-xl bg-[#694CFF] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#694CFF]/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Compare Properties</span>
              <span className="bg-indigo-700/80 text-indigo-100 text-[10px] px-2 py-0.5 rounded-full font-mono">
                {selectedProperties.length} / 3
              </span>
            </div>
            <p className="text-[11px] text-indigo-300">
              Evidence-based side-by-side decision matrix
            </p>
          </div>
        </div>

        {/* Selected Property chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
          {selectedProperties.map(prop => (
            <div
              key={prop.id}
              className="flex items-center gap-2 bg-indigo-950/80 border border-indigo-800 rounded-xl p-1.5 pr-2.5 text-xs shrink-0"
            >
              <img
                src={prop.photos.owner[0]?.url || prop.photos.fieldResearcher[0]?.url}
                alt={prop.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <div className="flex flex-col max-w-[120px]">
                <span className="font-semibold text-white truncate text-[11px]">{prop.name}</span>
                <span className="text-[10px] text-indigo-300">₹{prop.pricing.startingRent.toLocaleString('en-IN')}/mo</span>
              </div>
              <button
                onClick={() => onRemove(prop.id)}
                className="text-indigo-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                title="Remove from comparison"
                aria-label={`Remove ${prop.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t border-indigo-900/60 sm:border-0">
          <button
            onClick={onClear}
            className="text-xs text-indigo-300 hover:text-white px-2 py-1 transition-colors cursor-pointer"
          >
            Clear
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCompareModal}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="shadow-md shadow-[#694CFF]/40 text-xs font-semibold whitespace-nowrap"
          >
            Compare Now ({selectedProperties.length})
          </Button>
        </div>

      </div>
    </div>
  );
};
