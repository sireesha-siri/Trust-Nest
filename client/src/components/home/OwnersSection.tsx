import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck,
  Building2,
  Calendar,
  Phone,
  User,
  AlertCircle
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';

export const OwnersSection: React.FC = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Madhapur');
  const [preferredSlot, setPreferredSlot] = useState('weekday_morning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestedAudit, setRequestedAudit] = useState(false);
  const [auditRef, setAuditRef] = useState('');

  const handleQuickRequestAudit = () => {
    setRequestedAudit(true);
    showToast('Field verification request logged for HITEC City pilot!', 'success', 'Audit Requested');
    setTimeout(() => {
      setRequestedAudit(false);
    }, 4500);
  };

  const handleOpenAuditModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName.trim() || !ownerName.trim() || !phone.trim()) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    const ref = `TR-AUD-${Math.floor(1000 + Math.random() * 9000)}`;
    setAuditRef(ref);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast(`Field audit request logged for "${propertyName}"! (Pilot Scope)`, 'success');
      setTimeout(() => {
        setIsSubmitted(false);
        setIsModalOpen(false);
        setPropertyName('');
        setOwnerName('');
        setPhone('');
      }, 2200);
    }, 900);
  };

  return (
    <section id="owners-section" className="py-16 bg-[#F8F7FF] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-3xl border border-indigo-100 p-8 sm:p-12 shadow-sm space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#694CFF] bg-[#F3F0FF] px-3.5 py-1 rounded-full border border-[#694CFF]/20">
                Property Partners
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Are You a PG or Co-Living Owner in Hyderabad?
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Connect with verified relocating professionals. Request independent field audits to build unshakeable credibility and reduce tenant turnover.
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap items-center gap-2.5">
              {requestedAudit ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Audit Request Logged (Pilot Demo)
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleQuickRequestAudit}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                  className="shadow-sm shadow-[#694CFF]/25 font-semibold"
                >
                  Request Field Verification Visit
                </Button>
              )}
              <Button
                variant="outline"
                size="md"
                onClick={handleOpenAuditModal}
                className="font-medium bg-white text-gray-700"
              >
                Schedule Walkthrough
              </Button>
            </div>
          </div>

          {/* 3 Step Owner Transparency Model */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-indigo-50 text-xs">
            <div className="space-y-1.5 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="font-bold text-[#694CFF] block text-sm">1. Submit Listing Data</span>
              <p className="text-gray-500">Provide official rent terms, deposit policies, and room photos through your portal dashboard.</p>
            </div>

            <div className="space-y-1.5 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="font-bold text-[#694CFF] block text-sm">2. Scheduled Field Inspection</span>
              <p className="text-gray-500">A local field researcher conducts an objective walkthrough, confirming CCTV, hygiene, and room availability.</p>
            </div>

            <div className="space-y-1.5 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="font-bold text-[#694CFF] block text-sm">3. Verified Transparency Badge</span>
              <p className="text-gray-500">Your listing earns a high Trust Index and granular audit timestamps, attracting high-quality tenants.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Audit Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Property Field Verification"
        subtitle="Independent physical inspection for Hyderabad accommodations"
        maxWidth="lg"
      >
        {isSubmitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-emerald-950">Audit Request Logged</h4>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
              Your request for <strong>{propertyName}</strong> in {area} has been recorded in the demonstration pilot queue.
            </p>
            <div className="text-[11px] text-emerald-700 font-mono pt-1">
              Inspection Reference: {auditRef || 'TR-AUD-4812'}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitAudit} className="space-y-4 text-xs">
            {/* Pilot Disclosure Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Demonstration Environment Notice:</strong> Inspection booking is currently simulated for the Hyderabad pilot. Real-world physical dispatch will activate in Phase 6.
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Property / Hostel Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. Sri Balaji Luxury PG for Women"
                  className="w-full p-2.5 pl-8 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                />
                <Building2 className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Owner / Caretaker Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Ramesh Reddy"
                    className="w-full p-2.5 pl-8 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full p-2.5 pl-8 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Neighborhood Location
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#694CFF] cursor-pointer"
                >
                  <option value="Madhapur">Madhapur (Near Cyber Towers)</option>
                  <option value="HITEC City">HITEC City (Mindspace SEZ)</option>
                  <option value="Kondapur">Kondapur (Botanical Garden)</option>
                  <option value="Gachibowli">Gachibowli (Financial District)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Preferred Visit Slot
                </label>
                <div className="relative">
                  <select
                    value={preferredSlot}
                    onChange={(e) => setPreferredSlot(e.target.value)}
                    className="w-full p-2.5 pl-8 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#694CFF] cursor-pointer"
                  >
                    <option value="weekday_morning">Weekday Morning (9 AM - 12 PM)</option>
                    <option value="weekday_afternoon">Weekday Afternoon (2 PM - 5 PM)</option>
                    <option value="weekend">Weekend Inspection Slot</option>
                  </select>
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
              >
                Submit Inspection Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
};
