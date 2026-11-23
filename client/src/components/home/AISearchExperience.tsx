import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  X,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Info,
  RotateCcw,
  Cpu,
  CheckCircle2,
  ArrowDown
} from 'lucide-react';
import { ChecklistItem, StructuredAccommodationRequirements } from '../../types/aiSearch';
import { Property } from '../../types/property';
import { Button } from '../common/Button';
import { AIService } from '../../services/aiService';
import { DEFAULT_STRUCTURED_REQUIREMENTS } from '../../constants/aiDefaults';
import { scrollToSection } from '../../utils/scrollUtils';
import { useToast } from '../../context/ToastContext';

interface AISearchExperienceProps {
  properties: Property[];
  onFilteredResults: (results: Property[], checklist: ChecklistItem[], structured?: StructuredAccommodationRequirements) => void;
  onClearFilter?: () => void;
}

const DEFAULT_PROMPT = "I'm relocating to Hyderabad for a software job near HITEC City. I need a women's PG under ₹12,000 with food, CCTV, security, good transport connectivity and nearby hospitals.";

const PROMPT_SUGGESTIONS = [
  {
    title: "Women's PG in Madhapur/HITEC City (< ₹12k)",
    prompt: "I'm relocating to Hyderabad for a software engineering job near HITEC City. I need a women's PG under ₹12,000 per month with food, CCTV, security, good public transport connectivity, and nearby hospitals."
  },
  {
    title: "Tech Professional Co-living (< ₹16k)",
    prompt: "Moving to HITEC City for work. Looking for a premium co-living room with fast WiFi, dedicated work desk, power backup and metro access under ₹16,000."
  },
  {
    title: "Budget Men's PG near Madhapur (< ₹9k)",
    prompt: "Need a budget men's PG near Madhapur or Ayyappa society with 3 meals, clean water, and under ₹9,000 per month."
  }
];

export const AISearchExperience: React.FC<AISearchExperienceProps> = ({
  properties,
  onFilteredResults,
  onClearFilter,
}) => {
  const { showToast } = useToast();
  const [searchPrompt, setSearchPrompt] = useState(DEFAULT_PROMPT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [currentStructured, setCurrentStructured] = useState<StructuredAccommodationRequirements | undefined>(DEFAULT_STRUCTURED_REQUIREMENTS);
  const [isNewlyGenerated, setIsNewlyGenerated] = useState(false);
  const [matchedCount, setMatchedCount] = useState<number>(properties.length);

  // Editable Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'c1', label: "Women's Accommodation", category: 'type', checked: true, source: 'ai_extracted', certainty: 'explicit' },
    { id: 'c2', label: "Monthly rent under ₹12,000", category: 'budget', checked: true, source: 'ai_extracted', certainty: 'explicit' },
    { id: 'c3', label: "Food availability (3 meals included)", category: 'food', checked: true, source: 'ai_extracted', certainty: 'explicit' },
    { id: 'c4', label: "CCTV security surveillance", category: 'safety', checked: true, source: 'ai_extracted', certainty: 'explicit' },
    { id: 'c5', label: "24/7 Security guard & Biometric access", category: 'safety', checked: true, source: 'ai_extracted', certainty: 'explicit' },
    { id: 'c6', label: "Proximity to Metro transit (Blue Line)", category: 'connectivity', checked: true, source: 'ai_extracted', certainty: 'explicit' },
    { id: 'c7', label: "Proximity to Hospitals (Medicover/KIMS)", category: 'safety', checked: true, source: 'ai_extracted', certainty: 'explicit' },
    { id: 'c8', label: "Fresh verification timestamps (<14 days)", category: 'safety', checked: true, source: 'ai_extracted', certainty: 'inferred' },
  ]);

  // Real backend Gemini API requirement extraction
  const parsePromptAndRun = async (inputPrompt: string) => {
    if (!inputPrompt.trim()) {
      setError({
        message: 'Please enter a description of your accommodation requirements or select a scenario below.',
        code: 'EMPTY_INPUT',
      });
      showToast('Please enter your search requirements first', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await AIService.parseRequirements(inputPrompt.trim());

      setChecklist(response.generatedChecklist);
      setModelUsed(response.modelUsed);
      setAiExplanation(response.explanation);
      setCurrentStructured(response.structuredRequirements);
      const matched = applyFiltering(response.generatedChecklist, response.structuredRequirements);
      setMatchedCount(matched);
      setIsNewlyGenerated(true);

      showToast(
        `Gemini extracted ${response.generatedChecklist.length} criteria. Found ${matched} matching stays!`,
        'success',
        'Checklist Ready'
      );

      // Smooth scroll to the newly generated requirement checklist
      setTimeout(() => {
        scrollToSection('ai-checklist-container', 90);
      }, 200);

      // Remove highlight after 4.5 seconds
      setTimeout(() => {
        setIsNewlyGenerated(false);
      }, 4500);
    } catch (err: any) {
      setError({
        message: err.message || 'Live Gemini AI search is temporarily unavailable.',
        code: err.code || 'GEMINI_ERROR',
      });
      showToast(err.message || 'AI extraction failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyFiltering = (
    currentList: ChecklistItem[],
    structured?: StructuredAccommodationRequirements
  ): number => {
    const activeItems = currentList.filter(item => item.checked);
    const effectiveStructured = structured !== undefined ? structured : currentStructured;

    const results = properties.filter(prop => {
      // 1. Accommodation Category filter
      let targetType: string | null = null;
      if (effectiveStructured?.accommodationType?.value && effectiveStructured.accommodationType.value !== 'any') {
        targetType = effectiveStructured.accommodationType.value;
      }

      if (targetType) {
        if (targetType === 'womens_pg' && prop.category !== 'womens_pg') return false;
        if (targetType === 'mens_pg' && prop.category !== 'mens_pg') return false;
        if (targetType === 'coliving' && prop.category !== 'coliving') return false;
        if (targetType === 'student_stay' && prop.category !== 'student_stay') return false;
        if (targetType === 'studio_apartment' && prop.category !== 'studio_apartment') return false;
      } else {
        const wantsWomens = activeItems.some(i => i.label.toLowerCase().includes("women"));
        const wantsMens = activeItems.some(i => i.label.toLowerCase().includes("men's") || i.label.toLowerCase().includes("mens"));
        const wantsColiving = activeItems.some(i => i.label.toLowerCase().includes("co-living") || i.label.toLowerCase().includes("studio"));

        if (wantsWomens && prop.category !== 'womens_pg') return false;
        if (wantsMens && prop.category !== 'mens_pg') return false;
        if (wantsColiving && prop.category !== 'coliving' && prop.category !== 'studio_apartment') return false;
      }

      // 2. Budget ceiling filter
      let budgetCeiling: number | null = effectiveStructured?.maxMonthlyRent?.value || null;
      if (!budgetCeiling) {
        const budgetItem = activeItems.find(i => i.category === 'budget');
        if (budgetItem) {
          const match = budgetItem.label.match(/[0-9]+(?:,[0-9]+)?/);
          if (match) {
            budgetCeiling = parseInt(match[0].replace(/,/g, ''), 10);
          }
        }
      }

      if (budgetCeiling && prop.pricing.startingRent > budgetCeiling) {
        return false;
      }

      // 3. Food requirement filter
      const wantsFood = effectiveStructured?.foodRequirements?.required ?? activeItems.some(i => i.category === 'food' || i.label.toLowerCase().includes("food"));
      if (wantsFood && !prop.pricing.foodIncluded) return false;

      // 4. CCTV & Security requirement filter
      const wantsSecurity = (effectiveStructured?.safetyRequirements?.items?.length || 0) > 0 ||
        activeItems.some(i => i.label.toLowerCase().includes("cctv") || i.label.toLowerCase().includes("security"));
      if (wantsSecurity && !prop.verification.statusSummary.cctvAudited) return false;

      // 5. Metro proximity filter
      const wantsMetro = effectiveStructured?.publicTransportRequirements?.metroRequired ||
        activeItems.some(i => i.label.toLowerCase().includes("metro"));
      if (wantsMetro && prop.location.distanceToNearestMetroKm > 1.5) return false;

      return true;
    });

    const finalResults = results.length > 0 ? results : properties;
    onFilteredResults(finalResults, currentList, effectiveStructured);
    setMatchedCount(results.length);
    return results.length;
  };

  // Toggle checklist checkbox
  const toggleChecklistItem = (id: string) => {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    applyFiltering(updated);
  };

  // Remove checklist item
  const removeChecklistItem = (id: string) => {
    const updated = checklist.filter(item => item.id !== id);
    setChecklist(updated);
    applyFiltering(updated);
  };

  // Add custom checklist item
  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      label: newChecklistText.trim(),
      category: 'safety',
      checked: true,
      source: 'user_added',
      certainty: 'explicit',
    };
    const updated = [...checklist, newItem];
    setChecklist(updated);
    applyFiltering(updated);
    setNewChecklistText('');
    setShowAddChecklist(false);
  };

  return (
    <section id="ai-search-anchor" className="w-full">
      <div className="bg-white rounded-3xl border border-indigo-100 shadow-[0_10px_35px_-5px_rgba(105,76,255,0.12)] p-6 sm:p-8 space-y-6">

        {/* Header with AI Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#694CFF] text-white flex items-center justify-center shadow-md shadow-[#694CFF]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Google Gemini AI Accommodation Search
              </h3>
              <p className="text-xs text-gray-500">
                Natural-language requirement extraction powered by Gemini. AI extracts criteria into an editable checklist.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {modelUsed ? (
              <span className="text-[11px] font-semibold text-[#694CFF] bg-[#F3F0FF] px-2.5 py-1 rounded-full border border-[#694CFF]/25 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#694CFF]" />
                {modelUsed}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Live AI Integration
              </span>
            )}
          </div>
        </div>

        {/* Visual 4-Stage AI Journey Navigator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pb-2 border-b border-gray-100 text-[11px]">
          <div className="flex items-center gap-1.5 text-[#694CFF] font-semibold bg-[#F3F0FF] px-2.5 py-1.5 rounded-xl border border-[#694CFF]/20">
            <span className="w-4 h-4 rounded-full bg-[#694CFF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
            <span className="truncate">Enter Needs</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
            isAnalyzing 
              ? 'text-[#694CFF] font-semibold bg-purple-100/70 border-[#694CFF] animate-pulse' 
              : modelUsed 
              ? 'text-emerald-700 font-semibold bg-emerald-50 border-emerald-200' 
              : 'text-gray-500 bg-gray-50 border-gray-200'
          }`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              isAnalyzing ? 'bg-[#694CFF] text-white' : modelUsed ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
            }`}>2</span>
            <span className="truncate">{isAnalyzing ? 'Extracting...' : modelUsed ? 'Criteria Extracted' : 'AI Extraction'}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
            isNewlyGenerated 
              ? 'text-[#694CFF] font-semibold bg-purple-100/80 border-[#694CFF]' 
              : checklist.length > 0 
              ? 'text-indigo-900 font-semibold bg-indigo-50/60 border-indigo-200' 
              : 'text-gray-500 bg-gray-50 border-gray-200'
          }`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              checklist.length > 0 ? 'bg-[#694CFF] text-white' : 'bg-gray-300 text-gray-700'
            }`}>3</span>
            <span className="truncate">Edit Checklist</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600">
            <span className="w-4 h-4 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
            <span className="truncate">View Stays ({matchedCount})</span>
          </div>
        </div>

        {/* Natural Language Search Input Box */}
        <div className="relative">
          <div className="relative flex items-center">
            <textarea
              rows={3}
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              disabled={isAnalyzing}
              placeholder="e.g. I'm relocating to Hyderabad for a software job near HITEC City. I need a women's PG under ₹12,000 with food, CCTV, security and nearby hospitals..."
              className="w-full text-sm sm:text-base p-4 pr-36 rounded-2xl border-2 border-indigo-100 focus:border-[#694CFF] focus:outline-none focus:ring-4 focus:ring-[#694CFF]/10 text-gray-800 placeholder-gray-400 resize-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
            />

            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              {onClearFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchPrompt('');
                    setCurrentStructured(undefined);
                    onClearFilter();
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  Clear Search
                </button>
              )}
              <Button
                variant="primary"
                size="md"
                onClick={() => parsePromptAndRun(searchPrompt)}
                isLoading={isAnalyzing}
                disabled={isAnalyzing || !searchPrompt.trim()}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="shadow-md shadow-[#694CFF]/30 font-semibold"
              >
                {isAnalyzing ? 'Extracting...' : 'Analyze with AI'}
              </Button>
            </div>
          </div>
        </div>

        {/* Live Loading Animation & Progress Indicator */}
        {isAnalyzing && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-[#694CFF]/25 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-[#694CFF]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-[#694CFF]" />
                <span>Gemini AI is parsing your relocation requirements...</span>
              </div>
              <span className="text-[11px] text-gray-500 font-mono">Analyzing prompt</span>
            </div>
            <div className="w-full bg-indigo-100/80 rounded-full h-2 overflow-hidden">
              <div className="bg-[#694CFF] h-2 rounded-full animate-pulse w-3/4 transition-all duration-700" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span>Extracting budget, stay type, food and security preferences</span>
              <span className="font-medium text-[#694CFF]">Building requirement checklist...</span>
            </div>
          </div>
        )}

        {/* Error Feedback Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Live AI Extraction Notice:</strong> {error.message}
                {error.code === 'API_KEY_MISSING' && (
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    To activate live Gemini queries, set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">server/.env</code>.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => parsePromptAndRun(searchPrompt)}
                disabled={isAnalyzing}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Retry
              </Button>
              <button
                onClick={() => setError(null)}
                className="text-amber-500 hover:text-amber-700 p-1 rounded cursor-pointer"
                aria-label="Dismiss error notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Example Prompt Chips */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Try these realistic scenario prompts:
          </div>
          <div className="flex flex-wrap gap-2">
            {PROMPT_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                disabled={isAnalyzing}
                onClick={() => {
                  setSearchPrompt(item.prompt);
                  parsePromptAndRun(item.prompt);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#F8F7FF] hover:bg-[#F3F0FF] text-gray-700 hover:text-[#694CFF] border border-indigo-100 transition-colors text-left flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#694CFF]" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI-Generated Editable Checklist Section */}
        <div 
          id="ai-checklist-container" 
          className={`pt-5 border-t border-gray-100 space-y-4 rounded-2xl transition-all duration-500 ${
            isNewlyGenerated 
              ? 'p-4 bg-purple-50/50 border border-[#694CFF]/30 ring-4 ring-[#694CFF]/10 animate-checklist-highlight' 
              : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-gray-900">
                  AI-Generated Requirement Checklist
                </h4>
                <span className="text-[10px] font-bold bg-[#694CFF]/10 text-[#694CFF] px-2 py-0.5 rounded-full">
                  {checklist.filter(c => c.checked).length} Active Requirements
                </span>
                {isNewlyGenerated && (
                  <span className="text-[10px] font-bold bg-[#694CFF] text-white px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                    ✨ Freshly Extracted
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Toggle items or add your own. The property results below update automatically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddChecklist(!showAddChecklist)}
                className="text-xs font-semibold text-[#694CFF] hover:text-[#573BD6] bg-[#F3F0FF] hover:bg-[#EBE5FF] px-3 py-1.5 rounded-lg border border-[#694CFF]/20 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Requirement
              </button>

              <button
                onClick={() => {
                  const resetList = checklist.map(c => ({ ...c, checked: true }));
                  setChecklist(resetList);
                  applyFiltering(resetList);
                }}
                className="text-xs font-medium text-gray-500 hover:text-gray-800 p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                title="Reset all checkboxes"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add custom requirement inline input */}
          {showAddChecklist && (
            <form onSubmit={handleAddChecklist} className="flex gap-2 p-3 bg-[#F8F7FF] rounded-xl border border-indigo-100 animate-in fade-in duration-150">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="e.g. Attached washroom, Power backup, Lift/Elevator..."
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                autoFocus
              />
              <Button type="submit" variant="primary" size="sm">
                Add
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddChecklist(false)}>
                Cancel
              </Button>
            </form>
          )}

          {/* Checklist items list with certainty tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-start justify-between p-2.5 rounded-xl border transition-all text-xs ${item.checked
                  ? 'bg-purple-50/50 border-[#694CFF]/30 text-gray-900 shadow-sm'
                  : 'bg-gray-50/70 border-gray-200 text-gray-400 line-through'
                  }`}
              >
                <label className="flex items-start gap-2 cursor-pointer flex-1 mr-2 select-none">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="mt-0.5 rounded text-[#694CFF] focus:ring-[#694CFF] h-4 w-4 border-gray-300 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className={item.checked ? 'font-medium' : 'font-normal'}>
                      {item.label}
                    </span>
                    {item.certainty && (
                      <span className={`text-[9.5px] font-semibold mt-0.5 ${item.certainty === 'explicit'
                        ? 'text-emerald-700'
                        : item.certainty === 'inferred'
                          ? 'text-indigo-600'
                          : 'text-gray-400'
                        }`}>
                        {item.certainty === 'explicit' ? '• User specified' : '• AI inferred'}
                      </span>
                    )}
                  </div>
                </label>

                <button
                  onClick={() => removeChecklistItem(item.id)}
                  className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                  title="Remove requirement"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* AI Explanation Banner */}
          <div className="bg-[#F8F7FF] border border-indigo-100 rounded-xl p-3.5 flex items-start gap-3 text-xs text-gray-700">
            <Sparkles className="w-4 h-4 text-[#694CFF] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                <strong>AI Matching Analysis:</strong> {aiExplanation || 'Filtering Hyderabad pilot database across HITEC City and Madhapur based on verified amenities, budget, and transit proximity.'}
              </p>
              <div className="text-[11px] text-gray-500">
                Notice: Gemini distinguishes explicitly stated user needs from inferred preferences and never fabricates unverified property details.
              </div>
            </div>
          </div>

          {/* Quick Jump to Matching Properties Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 border border-[#694CFF]/20 rounded-xl gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Found <strong>{matchedCount}</strong> verified propert{matchedCount === 1 ? 'y' : 'ies'} matching active criteria.
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => scrollToSection('properties-section', 84)}
              rightIcon={<ArrowDown className="w-3.5 h-3.5" />}
              className="shadow-sm shadow-[#694CFF]/20 whitespace-nowrap"
            >
              View Matching Stays ({matchedCount}) ↓
            </Button>
          </div>

        </div>

      </div>
    </section>
  );
};
