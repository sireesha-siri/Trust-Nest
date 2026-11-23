import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { 
  CheckCircle2,
  Mail,
  ArrowRight,
  Bookmark,
  Bell,
  Building2,
  Users
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNotified(true);
    showToast(
      `We'll notify ${email} when resident accounts launch for Hyderabad!`,
      'success',
      'Launch Updates'
    );
    setTimeout(() => {
      setNotified(false);
      setEmail('');
      onClose();
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resident Accounts & Profile"
      subtitle="Coming Soon in Phase 6 • Guest Access is 100% Active"
      maxWidth="md"
    >
      <div className="space-y-5 text-xs text-gray-700">
        
        {/* Guest Access Reassurance Banner */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-emerald-950 text-sm">
              TrustNest is 100% Guest-First
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              No account or login is required. You have full, unrestricted access to browse verified stays, run Google Gemini AI requirement searches, compare properties side-by-side, and inspect city intelligence.
            </p>
          </div>
        </div>

        {/* Future Capabilities Roadmap */}
        <div className="space-y-2.5">
          <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider text-gray-500">
            Planned for Phase 6 Resident Accounts:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
              <Bookmark className="w-4 h-4 text-[#694CFF] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">Cross-Device Shortlists</strong>
                <span className="text-gray-500">Sync saved stays across your laptop and phone.</span>
              </div>
            </div>

            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
              <Bell className="w-4 h-4 text-[#694CFF] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">Vacancy Alerts</strong>
                <span className="text-gray-500">Direct notifications when matching PGs open spots.</span>
              </div>
            </div>

            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
              <Building2 className="w-4 h-4 text-[#694CFF] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">Owner Portal</strong>
                <span className="text-gray-500">Direct listing management & audit booking.</span>
              </div>
            </div>

            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
              <Users className="w-4 h-4 text-[#694CFF] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">Observation History</strong>
                <span className="text-gray-500">Track community reports and helpfulness votes.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Launch Notification Form */}
        <div className="pt-2 border-t border-gray-100">
          {notified ? (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center text-xs space-y-1 text-indigo-900 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-[#694CFF] mx-auto" />
              <div className="font-bold">Notification Registered!</div>
              <p className="text-[11px] text-indigo-700">
                We'll email you when resident accounts launch for the Hyderabad rollout.
              </p>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="space-y-2">
              <label className="font-semibold text-gray-700 block">
                Get notified when resident accounts launch:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full text-xs p-2.5 pl-8 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                    required
                  />
                  <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Notify Me
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Primary Action: Continue Exploring */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full font-semibold shadow-sm shadow-[#694CFF]/20"
          >
            Continue Exploring as Guest
          </Button>
        </div>

      </div>
    </Modal>
  );
};
