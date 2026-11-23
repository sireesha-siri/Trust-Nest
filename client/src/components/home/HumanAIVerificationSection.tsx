import React from 'react';
import { 
  Bot, 
  UserCheck, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export const HumanAIVerificationSection: React.FC = () => {
  const aiResponsibilities = [
    { title: 'Natural-Language Extraction', desc: 'Parses conversational user inputs into explicit requirement checklists.' },
    { title: 'Duplicate-Image Detection', desc: 'Flags recycled marketing photos across multiple listings automatically.' },
    { title: 'Inconsistency & Anomaly Detection', desc: 'Detects discrepancies between claimed rent and real resident reports.' },
    { title: 'Suspicious-Claim Flagging', desc: 'Flags inflated claims (e.g. "50m to metro" when geospatial distance is 2.4km).' },
    { title: 'Information Freshness Alerts', desc: 'Triggers field inspection re-checks when availability or rent updates lapse.' },
    { title: 'Evidence Synthesis', desc: 'Summarizes verified observations without fabricating missing facts.' },
  ];

  const humanResponsibilities = [
    { title: 'Physical Field Walkthroughs', desc: 'Researchers visit properties in person, verifying real room dimensions and hygiene.' },
    { title: 'Geotagged Photo Collection', desc: 'Taking unedited timestamped photos of washrooms, bedrooms, and common areas.' },
    { title: 'Safety Equipment Audit', desc: 'Physically verifying fire extinguisher expiry tags, CCTV camera positions, and logbooks.' },
    { title: 'Owner Identity (KYC)', desc: 'Confirming caretaker and owner legal identities and tenancy terms.' },
    { title: 'Community Moderation', desc: 'Screening anonymous peer reports to prevent spam, defamation, or fake praises.' },
    { title: 'Incident Resolution', desc: 'Human coordinators investigate safety or maintenance complaints raised by residents.' },
  ];

  return (
    <section id="verification-section" className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#694CFF] bg-[#F3F0FF] px-3.5 py-1 rounded-full border border-[#694CFF]/20">
            Core Philosophy
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Human + AI: Real Intelligence Meets Boots on the Ground
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            AI should assist human decision-making, never independently certify physical safety. We separate computational pattern recognition from verified physical evidence.
          </p>
        </div>

        {/* Dual Pillar Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* AI Pillar Card */}
          <div className="bg-[#F8F7FF] rounded-3xl p-6 sm:p-8 border border-indigo-100/80 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#694CFF] text-white flex items-center justify-center shadow-md shadow-[#694CFF]/25">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">What AI Does</h3>
                    <p className="text-xs text-gray-500">Computational Intelligence & Anomaly Detection</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#694CFF] bg-white px-2.5 py-1 rounded-full border border-[#694CFF]/20">
                  Algorithmic Layer
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {aiResponsibilities.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-100 text-xs">
                    <Sparkles className="w-4 h-4 text-[#694CFF] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900 font-semibold">{item.title}: </strong>
                      <span className="text-gray-600">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-indigo-100/60 rounded-xl text-[11px] text-indigo-900 font-medium">
              💡 <strong>AI Boundary:</strong> AI never certifies physical safety or produces ungrounded ratings. It alerts human researchers to check specific points.
            </div>
          </div>

          {/* Human Pillar Card */}
          <div className="bg-emerald-50/40 rounded-3xl p-6 sm:p-8 border border-emerald-100/80 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#22C55E] text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">What Humans Do</h3>
                    <p className="text-xs text-gray-500">Field Researchers & Real-World Validation</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
                  Physical Ground Truth
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {humanResponsibilities.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-100 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900 font-semibold">{item.title}: </strong>
                      <span className="text-gray-600">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-100/60 rounded-xl text-[11px] text-emerald-950 font-medium">
              🛡️ <strong>Human Authority:</strong> Physical audits and evidence verification are conducted by local field researchers and validated through strict evidence standards.
            </div>
          </div>

        </div>

        {/* 4 Multi-Source Evidence Levels */}
        <div className="bg-[#F8F7FF] rounded-2xl p-6 border border-indigo-100 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-center">
            How TrustNest Distinguishes Information Sources
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1.5">
              <span className="font-bold text-indigo-700 block">1. Owner Submissions</span>
              <p className="text-gray-500">Self-declared rents, room counts, and marketing photos. Clearly tagged as "Owner Claimed".</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-1.5">
              <span className="font-bold text-emerald-700 block">2. Field Inspections</span>
              <p className="text-gray-500">Physical walkthroughs, hygiene audits, and verified photos taken by vetted researchers.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-1.5">
              <span className="font-bold text-blue-700 block">3. Community Reports</span>
              <p className="text-gray-500">Continuous anonymized feedback from verified residents (WiFi speeds, maintenance, street lights).</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-1.5">
              <span className="font-bold text-amber-700 block">4. Official Public Data</span>
              <p className="text-gray-500">Geocoded government police stations, Blue Line metro connectivity, and accredited hospitals.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
