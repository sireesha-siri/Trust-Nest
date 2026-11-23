import React, { useState, useMemo } from 'react';
import { Property, PhotoSource } from '../../types/property';
import { Modal } from '../common/Modal';
import { EvidenceFreshnessBadge } from './EvidenceFreshnessBadge';
import { CivicMap } from '../map/CivicMap';
import { DEMO_CITY_SERVICES } from '../../data/demoCityServices';
import { findNearestServices } from '../../utils/geoUtils';
import { PropertyService } from '../../services/propertyService';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Flag,
  Send,
  MapPin,
  HeartPulse,
  Train,
  Pill,
  Bus,
  Compass,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'evidence' | 'photos' | 'rooms' | 'amenities' | 'civic' | 'report'>('evidence');
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [activePhotoCategory, setActivePhotoCategory] = useState<PhotoSource>('field_researcher');
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Compute nearest civic services for this specific property using authentic coordinates
  const nearestServices = useMemo(() => {
    if (!property?.location?.coordinates) return null;
    return findNearestServices(
      property.location.coordinates.lat,
      property.location.coordinates.lng,
      DEMO_CITY_SERVICES
    );
  }, [property]);

  if (!property) return null;

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    setIsSubmittingReport(true);
    setReportError(null);

    try {
      await PropertyService.submitDiscrepancy(property.id, {
        observation: reportText.trim(),
      });
      setReportSubmitted(true);
      showToast('Discrepancy report recorded! Verification will trigger a re-audit.', 'success');
      setTimeout(() => {
        setReportSubmitted(false);
        setReportText('');
        setActiveTab('evidence');
      }, 2500);
    } catch (err: any) {
      console.error('[PropertyDetailModal] Discrepancy submission error:', err);
      const errMsg = err.message || 'Failed to submit report. Persistent database is currently offline.';
      setReportError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property.name}
      subtitle={`${property.location.address} • ${property.categoryLabel}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        
        {/* Synthetic Demo Data Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-300 rounded-xl p-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>Demonstration Record (DEMO DATA):</strong> This listing illustrates TrustNest’s multi-source verification architecture. Never claim synthetic properties have undergone actual legal audits in the real world.
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto gap-2 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('evidence')}
            className={`pb-3 px-3 font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'evidence'
                ? 'border-[#694CFF] text-[#694CFF]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Evidence & Verification
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`pb-3 px-3 font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'photos'
                ? 'border-[#694CFF] text-[#694CFF]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Multi-Source Photos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 px-3 font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'rooms'
                ? 'border-[#694CFF] text-[#694CFF]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Rooms & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('amenities')}
            className={`pb-3 px-3 font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'amenities'
                ? 'border-[#694CFF] text-[#694CFF]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Amenities & Transit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('civic')}
            className={`pb-3 px-3 font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'civic'
                ? 'border-[#694CFF] text-[#694CFF]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Civic Context & Map
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`pb-3 px-3 font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'report'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-rose-600'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            Report Discrepancy
          </button>
        </div>

        {/* Tab 1: Evidence & Verification Timeline */}
        {activeTab === 'evidence' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Trust Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between">
                <span className="text-xs text-gray-600 font-medium">Overall Trust Index</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-[#694CFF]">{property.verification.overallTrustScore}%</span>
                  <span className="text-xs text-gray-500">/ 100</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">Weighted by physical inspections</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
                <span className="text-xs text-gray-600 font-medium">Physical Field Visit</span>
                <div className="flex items-center gap-1.5 mt-1 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Inspected in Person</span>
                </div>
                <span className="text-[10px] text-gray-500 mt-1">Timestamp: {property.verification.timestamps.roomCondition}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between">
                <span className="text-xs text-gray-600 font-medium">Owner Identity (KYC)</span>
                <div className="flex items-center gap-1.5 mt-1 text-indigo-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>{property.owner.kycStatus}</span>
                </div>
                <span className="text-[10px] text-gray-500 mt-1">{property.owner.name} ({property.owner.role})</span>
              </div>
            </div>

            {/* Freshness / Outdated Discrepancy Warning Callout */}
            {property.verification.statusSummary.freshnessWarning && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950">
                    Evidence Freshness Warning — Revalidation Required
                  </p>
                  <p className="text-[11.5px] leading-relaxed">
                    {property.verification.statusSummary.freshnessNotice || 'Evidence is older than 14 days. Several owner claims have not been re-confirmed by physical inspection.'}
                  </p>
                </div>
              </div>
            )}

            {/* Granular Timestamps Table with EvidenceFreshnessBadge */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                Granular Audit Timestamps & Freshness Intelligence
              </h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 divide-x divide-gray-100 bg-gray-50/70 p-2.5 font-semibold text-gray-700">
                  <div>Verification Checkpoint</div>
                  <div>Last Confirmed On & Status</div>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="grid grid-cols-2 divide-x divide-gray-100 p-2.5 items-center">
                    <span className="text-gray-600">Rent & Security Deposit Confirmation</span>
                    <div>
                      <EvidenceFreshnessBadge timestampText={property.verification.timestamps.rentConfirmation} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100 p-2.5 items-center">
                    <span className="text-gray-600">Room Availability & Vacant Beds</span>
                    <div>
                      <EvidenceFreshnessBadge timestampText={property.verification.timestamps.roomAvailability} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100 p-2.5 items-center">
                    <span className="text-gray-600">Room Condition & Hygiene</span>
                    <div>
                      <EvidenceFreshnessBadge timestampText={property.verification.timestamps.roomCondition} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100 p-2.5 items-center">
                    <span className="text-gray-600">CCTV Coverage & Guard Register</span>
                    <div>
                      <EvidenceFreshnessBadge 
                        timestampText={property.verification.timestamps.cctvAndSecurity}
                        isWarning={!property.verification.statusSummary.cctvAudited}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100 p-2.5 items-center">
                    <span className="text-gray-600">Fire Safety & Extinguisher Tag</span>
                    <div>
                      <EvidenceFreshnessBadge 
                        timestampText={property.verification.timestamps.fireSafety}
                        isWarning={!property.verification.statusSummary.fireSafetyCompliant}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Timeline Log */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                Evidence History & Field Researcher Observations
              </h4>
              <div className="space-y-3">
                {property.verification.timeline.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl border border-gray-100 bg-white flex gap-3 text-xs">
                    <div className="w-2 rounded-full bg-[#694CFF] shrink-0" />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{item.title}</span>
                        <span className="text-[11px] text-gray-400 font-mono">{item.timestamp}</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{item.observation}</p>
                      {item.verifiedBy && (
                        <div className="text-[10px] text-[#694CFF] font-medium flex items-center gap-1 mt-1">
                          <ShieldCheck className="w-3 h-3 text-[#694CFF]" />
                          Logged by: {item.verifiedBy}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Multi-Source Photos */}
        {activeTab === 'photos' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Category selection */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActivePhotoCategory('field_researcher')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activePhotoCategory === 'field_researcher'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Field Researcher ({property.photos.fieldResearcher.length})
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoCategory('owner')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activePhotoCategory === 'owner'
                    ? 'bg-[#694CFF] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Owner Uploads ({property.photos.owner.length})
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoCategory('community')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activePhotoCategory === 'community'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Community Photos ({property.photos.community.length})
              </button>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(activePhotoCategory === 'field_researcher'
                ? property.photos.fieldResearcher
                : activePhotoCategory === 'owner'
                ? property.photos.owner
                : property.photos.community
              ).map((photo) => (
                <div key={photo.id} className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                  <div className="h-44 overflow-hidden bg-gray-100">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="font-semibold text-gray-700 capitalize">
                        Source: {photo.source.replace('_', ' ')}
                      </span>
                      <span>{photo.uploadedAt}</span>
                    </div>
                    <p className="text-gray-600">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Rooms & Pricing */}
        {activeTab === 'rooms' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.roomOptions.map((room, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-gray-900 text-sm">{room.type}</h5>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      room.availableBeds > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {room.availableBeds > 0 ? `${room.availableBeds} Beds Vacant` : 'Fully Occupied'}
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-[#694CFF]">
                    ₹{room.rentPerMonth.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-500">/month</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-100">
                    <div>Security Deposit: ₹{room.deposit.toLocaleString('en-IN')}</div>
                    <div>Attached Bathroom: {room.attachedWashroom ? '✓ Yes' : '✕ No'}</div>
                    <div>Air Conditioning: {room.acAvailable ? '✓ AC' : '✕ Non-AC'}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#F8F7FF] rounded-xl text-xs text-gray-600 border border-indigo-50">
              <strong>Notice Period:</strong> {property.pricing.noticePeriodDays} days notice required before vacating. Rent includes water & maintenance charges.
            </div>
          </div>
        )}

        {/* Tab 4: Amenities & Transit */}
        {activeTab === 'amenities' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {property.amenities.map((amenity) => (
                <div key={amenity.id} className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/60 flex items-center justify-between">
                  <span className="font-medium text-gray-800">{amenity.name}</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Verified {amenity.lastCheckedDate}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
              <h5 className="font-bold text-gray-900">Nearby Transit Connectivity</h5>
              <div className="text-gray-600 space-y-1">
                <div>• Nearest Metro: <strong>{property.location.nearestMetroStation}</strong> ({property.location.distanceToNearestMetroKm} km)</div>
                <div>• Proximity to HITEC City Cyber Towers: <strong>{property.location.distanceToHitecCityKm} km</strong></div>
                <div>• Auto-rickshaw stand: 150m walking distance</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Civic Context & Locality Map (Milestone 4 Integration) */}
        {activeTab === 'civic' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            
            {/* Locality Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#694CFF]" />
                <span className="text-gray-800">
                  Locality Cluster: <strong>{property.location.area}, Hyderabad</strong> (Coordinates: {property.location.coordinates.lat}° N, {property.location.coordinates.lng}° E)
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                VERIFIED DISTANCES
              </span>
            </div>

            {/* Nearest Essential Services Grid */}
            {nearestServices && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Nearest Hospital */}
                {nearestServices.hospital && (
                  <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-800 flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-rose-600" />
                        Nearest Hospital & Trauma
                      </span>
                      <span className="font-extrabold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">
                        {nearestServices.hospital.distanceKm} km
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">{nearestServices.hospital.service.name}</div>
                    <div className="text-[11px] text-gray-500">{nearestServices.hospital.service.address}</div>
                    <div className="text-[10px] text-rose-700 font-medium pt-1 flex items-center justify-between">
                      <span>{nearestServices.hospital.service.operatingHours || '24/7 Emergency Care'}</span>
                      <span className="text-gray-400">Source: {nearestServices.hospital.service.evidenceSource.split(' ')[0]}</span>
                    </div>
                  </div>
                )}

                {/* Nearest Police Station */}
                {nearestServices.police && (
                  <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        Nearest Police & SHE Teams
                      </span>
                      <span className="font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                        {nearestServices.police.distanceKm} km
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">{nearestServices.police.service.name}</div>
                    <div className="text-[11px] text-gray-500">{nearestServices.police.service.address}</div>
                    <div className="text-[10px] text-blue-700 font-medium pt-1 flex items-center justify-between">
                      <span>Help: {nearestServices.police.service.contactNumber}</span>
                      <span className="text-gray-400">Cyberabad Police</span>
                    </div>
                  </div>
                )}

                {/* Nearest Metro Station */}
                {nearestServices.metro && (
                  <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-800 flex items-center gap-1.5">
                        <Train className="w-4 h-4 text-indigo-600" />
                        Nearest Metro Station
                      </span>
                      <span className="font-extrabold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
                        {nearestServices.metro.distanceKm} km
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">{nearestServices.metro.service.name}</div>
                    <div className="text-[11px] text-gray-500">{nearestServices.metro.service.address}</div>
                    <div className="text-[10px] text-indigo-700 font-medium pt-1 flex items-center justify-between">
                      <span>{nearestServices.metro.service.operatingHours || '06:00 AM - 11:00 PM'}</span>
                      <span className="text-gray-400">Hyderabad Metro Rail</span>
                    </div>
                  </div>
                )}

                {/* Nearest 24/7 Pharmacy */}
                {nearestServices.pharmacy && (
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        Nearest 24/7 Pharmacy
                      </span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                        {nearestServices.pharmacy.distanceKm} km
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">{nearestServices.pharmacy.service.name}</div>
                    <div className="text-[11px] text-gray-500">{nearestServices.pharmacy.service.address}</div>
                    <div className="text-[10px] text-emerald-700 font-medium pt-1 flex items-center justify-between">
                      <span>24 Hours / 7 Days</span>
                      <span className="text-gray-400">Licensed Chemist</span>
                    </div>
                  </div>
                )}

                {/* Nearest Bus Stop */}
                {nearestServices.bus_stop && (
                  <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/30 space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-800 flex items-center gap-1.5">
                        <Bus className="w-4 h-4 text-amber-600" />
                        Nearest TSRTC Commuter Bus Stop
                      </span>
                      <span className="font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                        {nearestServices.bus_stop.distanceKm} km
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">{nearestServices.bus_stop.service.name}</div>
                    <div className="text-[11px] text-gray-500">{nearestServices.bus_stop.service.address}</div>
                    <div className="text-[10px] text-amber-800 font-medium pt-1">
                      Key Routes: {nearestServices.bus_stop.service.keyFeatures.join(' • ')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Embedded Mini CivicMap for this property */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Interactive Neighborhood Radar Map
              </h4>
              <CivicMap
                properties={[property]}
                cityServices={DEMO_CITY_SERVICES}
                selectedPropertyId={property.id}
                center={[property.location.coordinates.lat, property.location.coordinates.lng]}
                zoom={15}
                height="300px"
                showControls={false}
                interactive={true}
              />
            </div>

            {/* Transparency Disclaimer */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500 space-y-1">
              <div><strong>Transparency Note:</strong> Proximity measurements are computed using great-circle geodetic formulas between recorded coordinates and official transit/civic node listings.</div>
              <div>Actual walking distances may vary depending on local pedestrian infrastructure and road crossings.</div>
            </div>

          </div>
        )}

        {/* Tab 6: Report Discrepancy */}
        {activeTab === 'report' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-800">
              <strong>Community Moderation & Reporting:</strong> If you visited this property and observed discrepancies (e.g. rent different from listing, non-functional CCTV, hygiene issues), let us know. Submissions are reviewed by community moderators and protect reviewer anonymity.
            </div>

            {reportError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{reportError}</span>
              </div>
            )}

            {reportSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center text-xs space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <div className="font-bold">Discrepancy Report Logged</div>
                <p>Thank you! Your feedback will trigger a field researcher re-check.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700">
                  Describe what you observed:
                </label>
                <textarea
                  rows={4}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="e.g. Visited yesterday. The caretaker stated rent is ₹12,500 instead of ₹11,500, or the corridor CCTV was covered..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#694CFF] focus:border-transparent"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingReport}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  {isSubmittingReport ? 'Saving to Database...' : 'Submit Anonymous Report'}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Caretaker Contact:</span>
            <strong className="text-gray-800 font-mono">{property.owner.contactPhone}</strong>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(property.owner.contactPhone);
                setCopiedPhone(true);
                showToast(`Copied ${property.owner.contactPhone} to clipboard`, 'info');
                setTimeout(() => setCopiedPhone(false), 2000);
              }}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              title="Copy phone number"
            >
              {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

      </div>
    </Modal>
  );
};
