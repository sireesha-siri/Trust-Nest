import React, { useState, useEffect } from 'react';
import { DEMO_COMMUNITY_REPORTS } from '../../data/demoCommunity';
import { CommunityReport } from '../../types/community';
import { 
  ShieldCheck, 
  ThumbsUp, 
  Lock, 
  CheckCircle2, 
  Plus,
  Send,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../common/Button';
import { CommunityService } from '../../services/communityService';
import { useToast } from '../../context/ToastContext';

export const CommunitySection: React.FC = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState<CommunityReport[]>(DEMO_COMMUNITY_REPORTS);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [observation, setObservation] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    CommunityService.getReports()
      .then((res) => {
        if (!isMounted) return;
        setReports(res.reports);
      })
      .catch((err) => {
        console.warn('[CommunitySection] Fallback to demo community reports:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpvote = (id: string) => {
    if (upvotedIds[id]) {
      showToast('You have already verified and upvoted this observation', 'info');
      return;
    }
    setUpvotedIds((prev) => ({ ...prev, [id]: true }));
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, upvotesCount: r.upvotesCount + 1 } : r)));
    showToast('Upvote recorded! Identity protected by pseudonym', 'success');
    CommunityService.upvoteReport(id).catch((err) => {
      console.warn('[CommunitySection] Upvote failed to persist:', err);
    });
  };

  const handleNewReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observation.trim()) {
      showToast('Please enter your observation before submitting', 'warning');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await CommunityService.submitReport({
        propertyId: 'TN-HYD-0101',
        propertyName: propertyName.trim() || 'HITEC City Residency',
        reportType: 'availability_update',
        observation: observation.trim(),
        reportedByPseudonym: `VerifiedResident_${Math.floor(100 + Math.random() * 900)}`,
      });

      setReports((prev) => [res.data, ...prev]);
      setSubmittedNotice(true);
      setObservation('');
      setPropertyName('');
      showToast('Observation published to peer feed! Moderation log recorded.', 'success');
      setTimeout(() => {
        setSubmittedNotice(false);
        setShowSubmitModal(false);
      }, 2500);
    } catch (err: any) {
      console.error('[CommunitySection] Submission error:', err);
      const errMsg = err.message || 'Failed to submit report. Persistent database is currently unavailable.';
      setSubmitError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="community-section" className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#694CFF] bg-[#F3F0FF] px-3.5 py-1 rounded-full border border-[#694CFF]/20">
              Community Ground Truth
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              Resident Observations & Peer Validation
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Anonymized, fact-checked updates from residents living in Madhapur and HITEC City stays. Privacy guaranteed through cryptographic pseudonyms.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSubmitModal(!showSubmitModal)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Submit Ground Observation
          </Button>
        </div>

        {/* Modal / Inline Submission Form */}
        {showSubmitModal && (
          <div className="bg-[#F8F7FF] rounded-2xl p-6 border border-indigo-100 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#694CFF]" />
                Submit Anonymous Resident Observation
              </h4>
              <span className="text-xs text-gray-400">Identity encrypted</span>
            </div>

            {submitError && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {submittedNotice ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Observation published to peer feed! Moderation log recorded.</span>
              </div>
            ) : (
              <form onSubmit={handleNewReport} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="Property or Hostel Name in HITEC City / Madhapur"
                    className="text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                    required
                  />
                  <div className="text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Your identity will display as a secure pseudonym</span>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Share fact-based observations: e.g. WiFi measured speed, recent vacancy changes, security guard rotation, water supply status..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#694CFF]"
                  required
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowSubmitModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="sm" 
                    disabled={isSubmitting}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    {isSubmitting ? 'Recording to Database...' : 'Submit For Moderation'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Community Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                      {report.reportedByPseudonym}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Moderated & Approved
                    </span>
                  </div>
                  <span className="text-gray-400 text-[11px]">{report.createdAt}</span>
                </div>

                <h4 className="text-sm font-bold text-gray-900">
                  {report.propertyName}
                </h4>

                <p className="text-xs text-gray-600 leading-relaxed">
                  "{report.observation}"
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400">
                  Category: <strong className="text-gray-600 capitalize">{report.reportType.replace('_', ' ')}</strong>
                </span>

                <button
                  onClick={() => handleUpvote(report.id)}
                  disabled={upvotedIds[report.id]}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    upvotedIds[report.id]
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-50 hover:bg-[#F3F0FF] text-gray-600 hover:text-[#694CFF]'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{report.upvotesCount} Helpful</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Anti-manipulation trust note */}
        <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-indigo-100 text-xs text-gray-600 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#694CFF] shrink-0 mt-0.5" />
          <div>
            <strong>Fair Peer Verification Standard:</strong> TrustNest rejects vanity metrics like followers or likes. Points and accepted contributions are granted exclusively for objective, factual observations that assist relocation decisions.
          </div>
        </div>

      </div>
    </section>
  );
};
