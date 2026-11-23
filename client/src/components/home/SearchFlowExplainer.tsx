import React from 'react';
import { 
  Sparkles, 
  CheckSquare, 
  Eye, 
  ShieldCheck 
} from 'lucide-react';

export const SearchFlowExplainer: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Natural-Language Input',
      desc: 'Describe what you need just like speaking to a friend: budget, commute target, safety expectations, food preferences.',
      icon: Sparkles,
      color: 'bg-purple-100 text-[#694CFF]',
    },
    {
      step: '02',
      title: 'Checklist Extraction',
      desc: 'AI parses key criteria into an editable checklist. You can add, remove, or modify items anytime to refine matches.',
      icon: CheckSquare,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      step: '03',
      title: 'Ground-Truth Verification',
      desc: 'AI matches only against properties with timestamped field visits, genuine photos, and recent availability updates.',
      icon: Eye,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      step: '04',
      title: 'Confident Relocation',
      desc: 'Inspect granular timestamps, review nearby hospitals and metro stations, and connect with direct owners.',
      icon: ShieldCheck,
      color: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#694CFF] bg-[#F3F0FF] px-3 py-1 rounded-full border border-[#694CFF]/20">
            Intelligent Discovery
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
            How AI-Powered Search Works
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Eliminating frustrating multi-filter matrices with natural-language understanding backed by real human verification.
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={idx} 
                className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-sm ${item.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-gray-200 group-hover:text-[#694CFF]/30 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
