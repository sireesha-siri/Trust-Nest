import React, { useState } from 'react';
import { 
  EyeOff, 
  MapPin, 
  AlertOctagon, 
  FileCheck, 
  PhoneCall,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

export const TrustPrivacySection: React.FC = () => {
  const { showToast } = useToast();
  const [sosActive, setSosActive] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const emergencyContacts = [
    { label: 'National Emergency Helpline', number: '112', type: 'Centralized Police/Medical/Fire' },
    { label: 'Telangana Women Safety (SHE Teams)', number: '040 2785 2400', type: 'Dedicated Women Protection' },
    { label: 'Cyberabad Police Control Room', number: '100 / 94906 17100', type: 'Local Law Enforcement' },
    { label: 'Medicover Hospital Emergency Trauma', number: '040 6833 4455', type: 'HITEC City Medical Dispatch' },
  ];

  const handleCopyContact = (number: string, label: string) => {
    navigator.clipboard?.writeText(number);
    setCopiedNumber(number);
    showToast(`Copied ${label} (${number}) to clipboard`, 'info');
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const handleSimulateSos = () => {
    setSosActive(true);
    showToast('Simulating emergency dispatch protocol (Demo Mode)', 'warning', 'Emergency Dispatch');
    setTimeout(() => setSosActive(false), 4500);
  };

  return (
    <section id="safety-section" className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#694CFF] bg-[#F3F0FF] px-3.5 py-1 rounded-full border border-[#694CFF]/20">
            Safety, Governance & Privacy
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Trust & Privacy Architecture
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Protecting vulnerable relocating citizens through rigorous data boundaries, cryptographic reviewer anonymity, and verified public resources.
          </p>
        </div>

        {/* 4 Pillars of Civic Governance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#F8F7FF] border border-indigo-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#694CFF] flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Anonymized Reviewer Privacy</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We never expose tenant phone numbers, names or workplace details. Feedback appears under rotating cryptographically hashed pseudonyms.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8F7FF] border border-indigo-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Consent-Based Location</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Geographic coordinates are collected solely with explicit user opt-in. We never background-track user whereabouts or sell relocation habits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8F7FF] border border-indigo-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No Fictional Certifications</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We never state an accommodation is "100% Guaranteed Safe" or claim fictional municipal approvals. Every fact links to timestamped evidence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8F7FF] border border-indigo-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Transparent AI Limits</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              AI helps detect anomalies and extract user criteria. AI does not autonomously contact law enforcement or certify building safety.
            </p>
          </div>
        </div>

        {/* Safety & Emergency Dispatch Desk (Simulated Demonstration) */}
        <div className="bg-[#1E1B4B] text-white rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-400/30 px-2.5 py-0.5 rounded-full font-bold">
                  Simulated Demo Tool
                </span>
                <span className="text-xs text-indigo-300">Hyderabad Emergency Hub</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Public Safety Resources & Emergency Directory
              </h3>
            </div>

            <div className="text-xs text-indigo-200 max-w-sm">
              In real-world critical emergencies, always call official emergency numbers directly from your phone.
            </div>
          </div>

          {/* Directory numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyContacts.map((contact, idx) => (
              <div key={idx} className="bg-indigo-950/70 p-4 rounded-2xl border border-indigo-800 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-indigo-300 font-medium block">{contact.type}</span>
                  <div className="text-sm font-bold text-white mt-0.5">{contact.label}</div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="text-base font-mono font-extrabold text-amber-300 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    <span>{contact.number}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyContact(contact.number, contact.label)}
                    className="p-1.5 rounded-lg bg-indigo-900/80 hover:bg-indigo-800 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy phone number"
                    aria-label={`Copy ${contact.label} number`}
                  >
                    {copiedNumber === contact.number ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Simulated SOS Interface with Consent Notice */}
          <div className="bg-indigo-900/40 p-4 rounded-2xl border border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-indigo-200 select-none">
                <input
                  type="checkbox"
                  checked={locationConsent}
                  onChange={(e) => setLocationConsent(e.target.checked)}
                  className="rounded text-[#694CFF] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>I consent to temporary location access for emergency assistance demonstration</span>
              </label>
            </div>

            <Button
              variant="danger"
              size="sm"
              disabled={!locationConsent}
              onClick={handleSimulateSos}
              leftIcon={<AlertOctagon className="w-4 h-4" />}
            >
              {sosActive ? 'Simulating Dispatch Channel...' : 'Simulate Emergency Dispatch'}
            </Button>
          </div>

          {sosActive && (
            <div className="p-3 bg-rose-950/80 border border-rose-500 rounded-xl text-xs text-rose-200 animate-in fade-in duration-200">
              ⚠️ <strong>Simulated Alert Notice:</strong> In this demo environment, no external services or emergency authorities were contacted. Location data was not transmitted.
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
