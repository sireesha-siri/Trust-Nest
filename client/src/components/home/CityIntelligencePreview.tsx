import React, { useState, useMemo, useEffect } from 'react';
import { DEMO_CITY_SERVICES } from '../../data/demoCityServices';
import { DEMO_PROPERTIES } from '../../data/demoProperties';
import { CityServiceItem, ServiceCategory } from '../../types/city';
import { Property } from '../../types/property';
import { CivicMap } from '../map/CivicMap';
import { PropertyDetailModal } from '../property/PropertyDetailModal';
import { CityService } from '../../services/cityService';
import { PropertyService } from '../../services/propertyService';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Train,
  HeartPulse,
  Pill,
  ShoppingBag,
  Bus,
  CheckCircle2,
  Compass,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CityIntelligencePreviewProps {
  onSelectProperty?: (property: Property) => void;
}

export const CityIntelligencePreview: React.FC<CityIntelligencePreviewProps> = ({
  onSelectProperty,
}) => {
  const { showToast } = useToast();
  const [cityServices, setCityServices] = useState<CityServiceItem[]>(DEMO_CITY_SERVICES);
  const [properties, setProperties] = useState<Property[]>(DEMO_PROPERTIES);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<CityServiceItem | null>(DEMO_CITY_SERVICES[0]);
  const [mapSelectedProperty, setMapSelectedProperty] = useState<Property | null>(null);
  const [copiedHelpline, setCopiedHelpline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    CityService.getCityServices()
      .then((res) => {
        if (!isMounted) return;
        setCityServices(res.services);
        if (res.services.length > 0) {
          setActiveItem((prev) => prev || res.services[0]);
        }
      })
      .catch((err) => {
        console.warn('[CityIntelligencePreview] Fallback to demo services:', err);
      });

    PropertyService.getProperties()
      .then((res) => {
        if (!isMounted) return;
        setProperties(res.properties);
      })
      .catch((err) => {
        console.warn('[CityIntelligencePreview] Fallback to demo properties:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServices = useMemo(() => {
    return cityServices.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedArea !== 'all' && item.area !== selectedArea) return false;
      return true;
    });
  }, [cityServices, selectedCategory, selectedArea]);

  const getCategoryIcon = (cat: ServiceCategory) => {
    switch (cat) {
      case 'hospital': return HeartPulse;
      case 'police': return ShieldCheck;
      case 'metro': return Train;
      case 'pharmacy': return Pill;
      case 'grocery': return ShoppingBag;
      case 'bus_stop': return Bus;
      default: return MapPin;
    }
  };

  const handlePropertySelection = (property: Property) => {
    setMapSelectedProperty(property);
    if (onSelectProperty) {
      onSelectProperty(property);
    }
  };

  return (
    <section id="city-intelligence-section" className="py-16 bg-[#F8F7FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#694CFF] bg-[#F3F0FF] px-3.5 py-1 rounded-full border border-[#694CFF]/20">
              Civic Pulse & Public Resources
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              Explore Hyderabad: Essential Services & Transit Map
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Verified public facilities across HITEC City, Madhapur, Gachibowli, and Kondapur. Map-based transit routes, emergency healthcare, and police outposts to help you understand your neighborhood.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-600">
            <Compass className="w-4 h-4 text-[#694CFF]" />
            <span>Pilot Focus: <strong>Cyber Towers Hub (0-3 km)</strong></span>
          </div>
        </div>

        {/* Evidence Transparency Notice Banner */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-purple-950">
            <ShieldCheck className="w-4 h-4 text-[#694CFF] shrink-0" />
            <span>
              <strong>Civic Evidence Transparency:</strong> Facilities are indexed from Telangana Health Services, Cyberabad Police Commissionerate, Hyderabad Metro Rail (L&T), and TSRTC schedules.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
            DEMO DATA PILOT
          </span>
        </div>

        {/* Unified Filter Controls: Category & Area */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${selectedCategory === 'all' ? 'bg-[#694CFF] text-white font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              All Services
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('hospital')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1 ${selectedCategory === 'hospital' ? 'bg-[#694CFF] text-white font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <HeartPulse className="w-3.5 h-3.5" /> Hospitals
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('police')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1 ${selectedCategory === 'police' ? 'bg-[#694CFF] text-white font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Police & SHE
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('metro')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1 ${selectedCategory === 'metro' ? 'bg-[#694CFF] text-white font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Train className="w-3.5 h-3.5" /> Metro Stations
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('pharmacy')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1 ${selectedCategory === 'pharmacy' ? 'bg-[#694CFF] text-white font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Pill className="w-3.5 h-3.5" /> 24/7 Chemists
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('bus_stop')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1 ${selectedCategory === 'bus_stop' ? 'bg-[#694CFF] text-white font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Bus className="w-3.5 h-3.5" /> TSRTC Buses
            </button>
          </div>

          {/* Area Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Area:</span>
            <select
              aria-label="Filter city services by area"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#694CFF] cursor-pointer"
            >
              <option value="all">All Pilot Areas</option>
              <option value="HITEC City">HITEC City</option>
              <option value="Madhapur">Madhapur</option>
              <option value="Gachibowli">Gachibowli</option>
              <option value="Kondapur">Kondapur</option>
            </select>
          </div>
        </div>

        {/* 1. Interactive Civic Map View */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#694CFF]" />
              Interactive Civic & Location Context Map
            </span>
            <span className="text-gray-400">OpenStreetMap (Zero API Key) • Authentic Geocodes</span>
          </div>

          <CivicMap
            properties={properties}
            cityServices={filteredServices}
            onSelectProperty={handlePropertySelection}
            activeFilter={selectedCategory}
            onFilterChange={(f) => setSelectedCategory(f === 'properties' ? 'all' : f)}
            height="500px"
            showControls={true}
          />
        </div>

        {/* 2. Facilities Directory & Selected Focus Radar Card */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between text-xs border-b border-gray-200 pb-2">
            <span className="font-bold text-gray-700 uppercase tracking-wider">
              Verified Public Facility Directory ({filteredServices.length} Listings)
            </span>
            <span className="text-gray-500">Click any card to inspect geocoded radar telemetry</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Services List (7 Cols) */}
            <div className="lg:col-span-7 space-y-3">
              {filteredServices.map((service) => {
                const IconComp = getCategoryIcon(service.category);
                const isSelected = activeItem?.id === service.id;

                return (
                  <div
                    key={service.id}
                    onClick={() => setActiveItem(service)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${isSelected
                      ? 'bg-white border-[#694CFF] ring-2 ring-[#694CFF]/15 shadow-md -translate-y-0.5'
                      : 'bg-white border-gray-200 hover:border-[#694CFF]/40 hover:shadow-sm'
                      }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${service.category === 'hospital' ? 'bg-rose-50 text-rose-600' :
                      service.category === 'police' ? 'bg-blue-50 text-blue-600' :
                        service.category === 'metro' ? 'bg-indigo-50 text-indigo-600' :
                          service.category === 'bus_stop' ? 'bg-amber-50 text-amber-600' :
                            'bg-emerald-50 text-emerald-600'
                      }`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                          {service.name}
                        </h4>
                        <span className="shrink-0 text-xs font-bold text-[#694CFF] bg-[#F3F0FF] px-2 py-0.5 rounded-full">
                          {service.distanceFromCyberTowersKm} km
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 truncate">
                        {service.categoryLabel} • {service.area}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {service.is24x7 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" /> 24/7 Operational
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {service.publicVerificationStatus}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Confirmed: {service.lastConfirmedDate}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Radar & Facility Deep-Dive (5 Cols) */}
            <div className="lg:col-span-5 sticky top-24">
              {activeItem ? (
                <div className="bg-white rounded-3xl border border-indigo-100 shadow-md p-6 space-y-5">

                  {/* Visual Radar Mockup */}
                  <div className="h-44 w-full rounded-2xl bg-gradient-to-br from-indigo-900 to-[#1E1B4B] p-4 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#694CFF_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-indigo-100">
                        Geocoded Public Asset
                      </span>
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Verified Status
                      </span>
                    </div>

                    <div className="relative z-10">
                      <div className="text-xs text-indigo-200">Selected Facility Coordinates</div>
                      <div className="text-lg font-mono font-bold text-white">
                        {activeItem.coordinates.lat}° N, {activeItem.coordinates.lng}° E
                      </div>
                      <div className="text-xs text-emerald-200 mt-1">
                        {activeItem.distanceFromCyberTowersKm} km from HITEC Cyber Towers Junction
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#694CFF]">
                        {activeItem.categoryLabel}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">
                        {activeItem.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {activeItem.address}
                      </p>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-xl space-y-1.5 text-xs text-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Operating Hours:</span>
                        <span className="font-semibold text-gray-800">{activeItem.operatingHours || (activeItem.is24x7 ? '24/7' : 'Standard Daytime')}</span>
                      </div>
                      {activeItem.contactNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Helpline:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-gray-800">{activeItem.contactNumber}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (activeItem.contactNumber) {
                                  navigator.clipboard?.writeText(activeItem.contactNumber);
                                  setCopiedHelpline(true);
                                  showToast(`Copied ${activeItem.contactNumber} to clipboard`, 'info');
                                  setTimeout(() => setCopiedHelpline(false), 2000);
                                }
                              }}
                              className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                              title="Copy helpline number"
                            >
                              {copiedHelpline ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Evidence Source:</span>
                        <span className="font-medium text-gray-700">{activeItem.evidenceSource}</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold uppercase text-gray-500 mb-2">
                        Verified Capabilities
                      </h5>
                      <div className="space-y-1.5">
                        {activeItem.keyFeatures.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#694CFF]" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Source: {activeItem.evidenceSource}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed {activeItem.lastConfirmedDate}
                    </span>
                  </div>

                </div>
              ) : null}
            </div>

          </div>
        </div>

        {/* Modal for Property Selected from Map */}
        <PropertyDetailModal
          property={mapSelectedProperty}
          isOpen={Boolean(mapSelectedProperty)}
          onClose={() => setMapSelectedProperty(null)}
        />

      </div>
    </section>
  );
};
