import React from 'react';
import { Modal } from '../common/Modal';
import { Property } from '../../types/property';
import { EvidenceFreshnessBadge } from './EvidenceFreshnessBadge';
import { Button } from '../common/Button';
import { 
  Scale, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Train, 
  MapPin
} from 'lucide-react';

interface PropertyComparisonModalProps {
  properties: Property[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProperty: (id: string) => void;
  onViewDetails: (property: Property) => void;
}

export const PropertyComparisonModal: React.FC<PropertyComparisonModalProps> = ({
  properties,
  isOpen,
  onClose,
  onRemoveProperty,
  onViewDetails,
}) => {
  if (!isOpen) return null;

  if (properties.length === 0) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Property Comparison"
        subtitle="Side-by-side evidence matrix"
        maxWidth="2xl"
      >
        <div className="text-center py-12 space-y-3">
          <Scale className="w-12 h-12 text-gray-300 mx-auto" />
          <h4 className="text-base font-bold text-gray-800">No properties selected for comparison</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Select up to 3 properties using the "Compare" checkbox on any listing card to inspect evidence side by side.
          </p>
          <Button variant="primary" size="sm" onClick={onClose} className="mt-2">
            Browse Properties
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evidence-Based Property Comparison"
      subtitle={`Side-by-side evaluation of ${properties.length} listing${properties.length > 1 ? 's' : ''} • Hyderabad Pilot`}
      maxWidth="6xl"
    >
      <div className="space-y-6">
        
        {/* Synthetic Data & Transparency Notice */}
        <div className="bg-amber-500/10 border border-amber-300 rounded-xl p-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded mr-1.5">
              DEMO DATA
            </span>
            <strong>Evidence Disclosure:</strong> TrustNest never rewards properties for unverified or missing information. Outdated timestamps and missing audit tags are highlighted in amber/red rather than assumed compliant.
          </div>
        </div>

        {/* Comparison Table Container (Horizontal Scroll for Responsive Design) */}
        <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse min-w-[700px]">
            
            {/* Header Row: Property Cards Snapshot */}
            <thead>
              <tr className="bg-[#F8F7FF] border-b border-gray-200">
                <th className="p-4 w-48 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/80 sticky left-0 z-10 border-r border-gray-200">
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[#694CFF]" />
                    <span>Evaluation Matrix</span>
                  </div>
                  <div className="text-[10px] font-normal text-gray-400 mt-0.5">
                    {properties.length} / 3 selected
                  </div>
                </th>

                {properties.map((prop) => (
                  <th key={prop.id} className="p-4 w-72 align-top border-r last:border-r-0 border-gray-200 bg-white">
                    <div className="space-y-3">
                      {/* Photo and Remove Button */}
                      <div className="relative h-32 rounded-xl overflow-hidden bg-gray-100 group">
                        <img
                          src={prop.photos.fieldResearcher[0]?.url || prop.photos.owner[0]?.url}
                          alt={prop.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => onRemoveProperty(prop.id)}
                          data-testid={`remove-compare-${prop.id}`}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                          title="Remove from comparison"
                          aria-label={`Remove ${prop.name}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm font-mono">
                          {prop.id}
                        </div>
                      </div>

                      {/* Title & Category */}
                      <div>
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#694CFF] border border-purple-200">
                          {prop.categoryLabel}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm mt-1.5 line-clamp-1">
                          {prop.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#694CFF] shrink-0" />
                          <span>{prop.location.area}, Hyderabad</span>
                        </p>
                      </div>

                      {/* Trust Score & View Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>{prop.verification.overallTrustScore}%</span>
                          <span className="text-[10px] text-gray-400 font-normal">Audit</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(prop)}
                          className="text-[11px] py-1 px-2.5 h-auto"
                        >
                          View Audit
                        </Button>
                      </div>
                    </div>
                  </th>
                ))}

                {/* Empty filler columns if fewer than 3 properties selected */}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <th key={`empty-${i}`} className="p-4 w-72 align-middle text-center bg-gray-50/40 border-r last:border-r-0 border-gray-200">
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-2">
                      <Scale className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="text-xs text-gray-400 font-medium">Add another property to compare</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Comparison Body Rows */}
            <tbody className="divide-y divide-gray-200 text-xs text-gray-700">
              
              {/* SECTION: PRICING & FINANCIALS */}
              <tr className="bg-indigo-50/50">
                <td colSpan={4} className="px-4 py-2 font-bold uppercase tracking-wider text-[10.5px] text-[#694CFF]">
                  1. Pricing, Deposit & Inclusions
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Starting Rent
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200 font-bold text-gray-900 text-sm">
                    ₹{prop.pricing.startingRent.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-gray-500">/mo</span>
                  </td>
                ))}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-rent-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Security Deposit
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200 text-gray-800">
                    ₹{prop.pricing.depositAmount.toLocaleString('en-IN')}
                  </td>
                ))}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-dep-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Food & 3-Meals
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200">
                    {prop.pricing.foodIncluded ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        3 Meals Included
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        <XCircle className="w-3.5 h-3.5 text-gray-400" />
                        Not Included
                      </span>
                    )}
                  </td>
                ))}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-food-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Notice Period & Utilities
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200">
                    <div>{prop.pricing.noticePeriodDays} Days Notice</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {prop.pricing.utilityIncluded ? 'Electricity/Water included' : 'Electricity on sub-meter'}
                    </div>
                  </td>
                ))}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-not-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              {/* SECTION: ROOM CONFIGURATIONS & VACANCIES */}
              <tr className="bg-indigo-50/50">
                <td colSpan={4} className="px-4 py-2 font-bold uppercase tracking-wider text-[10.5px] text-[#694CFF]">
                  2. Room Types & Availability
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Available Room Types
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200 space-y-1">
                    {prop.roomOptions.map((room, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] bg-gray-50 p-1.5 rounded">
                        <span className="font-medium text-gray-800">{room.type}</span>
                        <span className={`font-semibold ${room.availableBeds > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {room.availableBeds > 0 ? `${room.availableBeds} beds` : 'Full'}
                        </span>
                      </div>
                    ))}
                  </td>
                ))}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-rooms-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Washroom & AC Options
                </td>
                {properties.map((prop) => {
                  const hasAttached = prop.roomOptions.some(r => r.attachedWashroom);
                  const hasAC = prop.roomOptions.some(r => r.acAvailable);
                  return (
                    <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200 space-y-1 text-[11px]">
                      <div>{hasAttached ? '✓ Attached Washrooms Available' : '⚠ Common Washrooms Only'}</div>
                      <div>{hasAC ? '✓ AC Rooms Available' : 'Non-AC Only'}</div>
                    </td>
                  );
                })}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-wash-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              {/* SECTION: SAFETY & PHYSICAL AUDITS */}
              <tr className="bg-indigo-50/50">
                <td colSpan={4} className="px-4 py-2 font-bold uppercase tracking-wider text-[10.5px] text-[#694CFF]">
                  3. Safety, Security & Inspection Findings
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  CCTV Surveillance Audit
                </td>
                {properties.map((prop) => {
                  const audited = prop.verification.statusSummary.cctvAudited;
                  return (
                    <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200">
                      {audited ? (
                        <div className="text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 space-y-0.5">
                          <div className="font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Audited & Verified</span>
                          </div>
                          <p className="text-[10.5px] text-emerald-700">All corridors & gates covered</p>
                        </div>
                      ) : (
                        <div className="text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 space-y-0.5">
                          <div className="font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Audit Pending / Incomplete</span>
                          </div>
                          <p className="text-[10.5px] text-amber-800">Only gate camera recorded. Indoor coverage unverified.</p>
                        </div>
                      )}
                    </td>
                  );
                })}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-cctv-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Fire Safety Inspection
                </td>
                {properties.map((prop) => {
                  const compliant = prop.verification.statusSummary.fireSafetyCompliant;
                  return (
                    <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200">
                      {compliant ? (
                        <div className="text-emerald-800 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Extinguishers tagged & tested</span>
                        </div>
                      ) : (
                        <div className="text-rose-800 bg-rose-50 p-1.5 rounded border border-rose-200 font-semibold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Missing valid inspection tag</span>
                        </div>
                      )}
                    </td>
                  );
                })}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-fire-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              {/* SECTION: TRANSIT & LOCATION */}
              <tr className="bg-indigo-50/50">
                <td colSpan={4} className="px-4 py-2 font-bold uppercase tracking-wider text-[10.5px] text-[#694CFF]">
                  4. Transit, Commute & Emergency Services
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Metro Transit Proximity
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200">
                    <div className="font-bold text-gray-900 flex items-center gap-1">
                      <Train className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{prop.location.distanceToNearestMetroKm} km</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {prop.location.nearestMetroStation}
                    </div>
                  </td>
                ))}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-metro-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Distance to Cyber Towers
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200 font-medium text-gray-800">
                    {prop.location.distanceToHitecCityKm} km
                  </td>
                ))}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-cyber-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              {/* SECTION: EVIDENCE FRESHNESS INTELLIGENCE */}
              <tr className="bg-indigo-50/50">
                <td colSpan={4} className="px-4 py-2 font-bold uppercase tracking-wider text-[10.5px] text-[#694CFF]">
                  5. Granular Verification Timestamps & Freshness
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Rent & Deposit Audit
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200">
                    <EvidenceFreshnessBadge timestampText={prop.verification.timestamps.rentConfirmation} />
                  </td>
                ))}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-ts1-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Room Availability Check
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200">
                    <EvidenceFreshnessBadge timestampText={prop.verification.timestamps.roomAvailability} />
                  </td>
                ))}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-ts2-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              <tr>
                <td className="p-3.5 font-semibold text-gray-600 bg-gray-50/60 sticky left-0 z-10 border-r border-gray-200">
                  Security & CCTV Audit
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200">
                    <EvidenceFreshnessBadge 
                      timestampText={prop.verification.timestamps.cctvAndSecurity} 
                      isWarning={!prop.verification.statusSummary.cctvAudited}
                    />
                  </td>
                ))}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-ts3-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

              {/* SECTION: NEGATIVE / OUTDATED EVIDENCE HIGHLIGHT */}
              <tr className="bg-amber-50/80 border-t-2 border-amber-200">
                <td className="p-3.5 font-bold text-amber-950 bg-amber-100/60 sticky left-0 z-10 border-r border-amber-200">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Missing / Outdated Findings</span>
                  </div>
                </td>
                {properties.map((prop) => {
                  const isWarning = prop.verification.statusSummary.freshnessWarning;
                  const missingCCTV = !prop.verification.statusSummary.cctvAudited;
                  const missingFire = !prop.verification.statusSummary.fireSafetyCompliant;

                  if (isWarning || missingCCTV || missingFire) {
                    return (
                      <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-amber-200 bg-amber-50/50">
                        <div className="text-amber-900 text-xs space-y-1">
                          <strong className="block text-amber-950 font-bold">Needs Verification:</strong>
                          {isWarning && <div>• {prop.verification.statusSummary.freshnessNotice || 'Evidence is >14 days old'}</div>}
                          {missingCCTV && <div>• Corridors lack physical CCTV audit</div>}
                          {missingFire && <div>• Fire safety inspection tag unconfirmed</div>}
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={prop.id} className="p-3.5 border-r last:border-r-0 border-gray-200 text-emerald-700 font-medium bg-emerald-50/30">
                      <div className="flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>No negative discrepancies reported</span>
                      </div>
                    </td>
                  );
                })}
                {Array.from({ length: 3 - properties.length }).map((_, i) => (
                  <td key={`empty-neg-${i}`} className="p-3.5 border-r last:border-r-0 border-gray-200 bg-gray-50/20" />
                ))}
              </tr>

            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Comparing <strong className="text-gray-800">{properties.length}</strong> listings. You can select up to 3 listings concurrently.
          </div>
          <Button variant="primary" size="md" onClick={onClose}>
            Done Comparing
          </Button>
        </div>

      </div>
    </Modal>
  );
};
