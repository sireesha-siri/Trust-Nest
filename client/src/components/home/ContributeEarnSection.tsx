import React, { useState } from 'react';
import { CONTRIBUTOR_ROLES } from '../../data/demoCommunity';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';

export const ContributeEarnSection: React.FC = () => {
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [appliedRole, setAppliedRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('student');
  const [area, setArea] = useState('Madhapur');
  const [hours, setHours] = useState('10-15');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicantId, setApplicantId] = useState('');

  const handleQuickExpressInterest = (roleTitle: string) => {
    setAppliedRole(roleTitle);
    showToast(`Interest registered for ${roleTitle}! (Pilot Scope)`, 'success', 'Interest Registered');
    setTimeout(() => {
      setAppliedRole(null);
    }, 4500);
  };

  const handleOpenModal = (roleTitle: string) => {
    setSelectedRole(roleTitle);
    setIsSubmitted(false);
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      showToast('Please complete all required fields', 'warning');
      return;
    }

    const id = `TN-CONTRIB-${Math.floor(1000 + Math.random() * 9000)}`;
    setApplicantId(id);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast(`Interest registered for ${selectedRole}! (Pilot Scope)`, 'success');
      setTimeout(() => {
        setIsSubmitted(false);
        setSelectedRole(null);
        setFullName('');
        setEmail('');
        setPhone('');
      }, 2200);
    }, 800);
  };

  return (
    <section id="contribute-section" className="py-16 bg-[#F8F7FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#694CFF] bg-[#F3F0FF] px-3.5 py-1 rounded-full border border-[#694CFF]/20">
              Future Local Workforce Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              Contribute & Earn: Local Opportunities
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Creating structured earning opportunities for local students and youth in Hyderabad through ground-truth verification and neighbourhood intelligence.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-medium self-start md:self-auto flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Pilot Architecture (Future Scope)</span>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CONTRIBUTOR_ROLES.map((role, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#694CFF] flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded">
                    {role.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">
                  {role.role}
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {role.description}
                </p>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-gray-700 block">Core Duties:</span>
                  {role.responsibilities.map((resp, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                {appliedRole === role.role ? (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs text-center font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Interest Registered for Pilot!
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full font-medium"
                    onClick={() => handleQuickExpressInterest(role.role)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Express Interest
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenModal(role.role)}
                  className="text-[11px] text-[#694CFF] hover:underline font-medium text-center cursor-pointer"
                >
                  Apply with full profile →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Transparent Disclaimer */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 text-xs text-gray-600 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#694CFF] shrink-0 mt-0.5" />
          <div>
            <strong>Transparency Notice:</strong> Operational workforce contracts and milestone-based payments are part of TrustNest’s phased roadmap following the hackathon pilot. We do not claim an existing paid operational workforce currently operates.
          </div>
        </div>

      </div>

      {/* Role Interest Application Modal */}
      <Modal
        isOpen={Boolean(selectedRole)}
        onClose={() => setSelectedRole(null)}
        title={selectedRole ? `Register Interest: ${selectedRole}` : 'Contributor Onboarding'}
        subtitle="Part-time ground truth verification & civic research in Hyderabad"
        maxWidth="lg"
      >
        {isSubmitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-emerald-950">Application Registered</h4>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
              Thank you, <strong>{fullName}</strong>. Your interest for <strong>{selectedRole}</strong> has been saved. We will contact you at {email} when local onboarding commences.
            </p>
            <div className="text-[11px] text-emerald-700 font-mono pt-1">
              Applicant ID: {applicantId || 'TN-CONTRIB-7291'}
            </div>
          </div>
        ) : (
          <form onSubmit={handleApplicationSubmit} className="space-y-4 text-xs">
            {/* Future Scope Disclaimer */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Pilot Program Notice:</strong> This registry logs interest for our planned youth workforce pilot. No employment contract is created in this demonstration phase.
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sneha Reddy"
                  className="w-full p-2.5 pl-8 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sneha@example.com"
                    className="w-full p-2.5 pl-8 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone / WhatsApp *</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Current Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                >
                  <option value="student">College Student</option>
                  <option value="working">Working Professional</option>
                  <option value="resident">Local Resident</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Hyderabad Area</label>
                <div className="relative">
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full p-2.5 pl-8 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                  >
                    <option value="Madhapur">Madhapur</option>
                    <option value="HITEC City">HITEC City</option>
                    <option value="Kondapur">Kondapur</option>
                    <option value="Gachibowli">Gachibowli</option>
                  </select>
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Hours / Week</label>
                <select
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                >
                  <option value="5-10">5 - 10 hours</option>
                  <option value="10-15">10 - 15 hours</option>
                  <option value="15+">15+ hours</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedRole(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
};
