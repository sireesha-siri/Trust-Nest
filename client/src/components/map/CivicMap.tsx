import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Property } from '../../types/property';
import { CityServiceItem, ServiceCategory } from '../../types/city';
import {
  HeartPulse,
  ShieldCheck,
  Train,
  Pill,
  Bus,
  Home,
  Compass,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Info
} from 'lucide-react';

export interface CivicMapProps {
  properties?: Property[];
  cityServices?: CityServiceItem[];
  selectedPropertyId?: string;
  onSelectProperty?: (property: Property) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showControls?: boolean;
  interactive?: boolean;
  activeFilter?: 'all' | 'properties' | ServiceCategory;
  onFilterChange?: (filter: 'all' | 'properties' | ServiceCategory) => void;
}

// Center of Hyderabad IT Corridor (Cyber Towers, HITEC City)
const DEFAULT_CENTER: [number, number] = [17.4478, 78.3769];
const DEFAULT_ZOOM = 14;

export const CivicMap: React.FC<CivicMapProps> = ({
  properties = [],
  cityServices = [],
  selectedPropertyId,
  onSelectProperty,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = '500px',
  showControls = true,
  interactive = true,
  activeFilter: controlledFilter,
  onFilterChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [uncontrolledFilter, setUncontrolledFilter] = useState<'all' | 'properties' | ServiceCategory>('all');
  const activeFilter = controlledFilter ?? uncontrolledFilter;

  const handleFilterClick = (filter: 'all' | 'properties' | ServiceCategory) => {
    if (onFilterChange) {
      onFilterChange(filter);
    } else {
      setUncontrolledFilter(filter);
    }
  };

  const [tileError, setTileError] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'property' | 'service';
    data: Property | CityServiceItem;
  } | null>(null);

  // Helper to create category-coded HTML marker pins
  const createMarkerIcon = useCallback((
    category: 'property' | ServiceCategory,
    label: string,
    isSelected: boolean = false
  ) => {
    let bgGradient = 'from-violet-600 to-indigo-600';
    let iconSvg = '';
    const borderClass = isSelected ? 'border-amber-300' : 'border-white';
    const ringClass = isSelected 
      ? 'ring-4 ring-[#694CFF] ring-offset-2 scale-110 shadow-xl' 
      : 'shadow-md';

    switch (category) {
      case 'property':
        bgGradient = isSelected ? 'from-[#573BD6] to-[#4C1D95]' : 'from-[#694CFF] to-[#8B5CF6]';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`;
        break;
      case 'hospital':
        bgGradient = 'from-rose-500 to-red-600';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`;
        break;
      case 'police':
        bgGradient = 'from-blue-600 to-indigo-700';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`;
        break;
      case 'metro':
        bgGradient = 'from-indigo-600 to-violet-800';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`;
        break;
      case 'pharmacy':
        bgGradient = 'from-emerald-600 to-teal-700';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`;
        break;
      case 'bus_stop':
        bgGradient = 'from-amber-500 to-orange-600';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8m-8 4h8m-8 4h8M5 19V5a2 2 0 012-2h10a2 2 0 012 2v14M5 19h14M7 21v-2m10 2v-2"/></svg>`;
        break;
      case 'grocery':
        bgGradient = 'from-green-600 to-emerald-700';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`;
        break;
    }

    const html = `
      <div class="relative group cursor-pointer" style="transform: translate(-50%, -100%);">
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${bgGradient} text-white border-2 ${borderClass} ${ringClass} transition-all duration-200 hover:scale-110">
          <span class="shrink-0">${iconSvg}</span>
          <span class="text-[11px] font-bold tracking-tight whitespace-nowrap drop-shadow-sm">${label}</span>
        </div>
        <div class="w-2.5 h-2.5 bg-gradient-to-br ${bgGradient} rotate-45 mx-auto -mt-1.5 border-r border-b ${borderClass}"></div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-div-pin',
      html,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive ? 'center' : false,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
      });

      // Standard OSM Tile Layer (Zero proprietary API keys needed, zero tracking)
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });

      tileLayer.on('tileerror', () => {
        setTileError(true);
      });

      tileLayer.addTo(map);

      // Layer group for dynamic markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Ensure proper sizing after mount
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [center, zoom, interactive]);

  // Keep map container responsive on resize
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;

    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Populate markers whenever dependencies change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    const bounds = L.latLngBounds([]);

    // 1. Properties Markers
    if (activeFilter === 'all' || activeFilter === 'properties') {
      properties.forEach((prop) => {
        if (!prop.location?.coordinates?.lat || !prop.location?.coordinates?.lng) return;
        const { lat, lng } = prop.location.coordinates;
        if (isNaN(lat) || isNaN(lng)) return;

        const isSelected = prop.id === selectedPropertyId;
        const icon = createMarkerIcon(
          'property',
          `₹${(prop.pricing.startingRent / 1000).toFixed(1)}k`,
          isSelected
        );

        const marker = L.marker([lat, lng], { icon });

        const popupContent = document.createElement('div');
        popupContent.className = 'p-3.5 space-y-2.5 text-xs max-w-xs';
        popupContent.innerHTML = `
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-50 text-[#694CFF] border border-purple-200">
                ${prop.categoryLabel}
              </span>
              <span class="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                DEMO DATA
              </span>
            </div>
            <h4 class="font-bold text-sm text-gray-900 leading-snug">${prop.name}</h4>
            <p class="text-[11px] text-gray-500">${prop.location.address}</p>
          </div>

          <div class="bg-purple-50/60 p-2 rounded-lg border border-purple-100 flex items-center justify-between">
            <span class="text-gray-600 font-medium">Starting Rent:</span>
            <span class="font-extrabold text-[#694CFF] text-sm">₹${prop.pricing.startingRent.toLocaleString('en-IN')}<span class="text-[10px] font-normal text-gray-500">/mo</span></span>
          </div>

          <div class="space-y-1 text-[11px] text-gray-600 border-t border-gray-100 pt-1.5">
            <div>• Metro: <strong>${prop.location.nearestMetroStation}</strong> (${prop.location.distanceToNearestMetroKm} km)</div>
            <div>• Cyber Towers: <strong>${prop.location.distanceToHitecCityKm} km</strong></div>
            <div>• Trust Score: <strong class="text-emerald-700">${prop.verification.overallTrustScore}% (Inspected)</strong></div>
          </div>

          <button id="inspect-prop-${prop.id}" class="w-full mt-2 py-1.5 px-3 bg-[#694CFF] hover:bg-[#573BD6] text-white font-semibold rounded-lg text-center text-xs transition cursor-pointer flex items-center justify-center gap-1">
            View Verified Dossier & Photos
          </button>
        `;

        marker.bindPopup(popupContent, { className: 'trustnest-map-popup' });
        marker.on('popupopen', () => {
          setSelectedEntity({ type: 'property', data: prop });
          const btn = document.getElementById(`inspect-prop-${prop.id}`);
          if (btn && onSelectProperty) {
            btn.onclick = () => {
              onSelectProperty(prop);
            };
          }
        });

        marker.addTo(markersLayer);
        bounds.extend([lat, lng]);

        if (isSelected) {
          marker.openPopup();
        }
      });
    }

    // 2. Civic Services Markers
    if (activeFilter === 'all' || activeFilter !== 'properties') {
      const filteredServices = cityServices.filter(s => 
        activeFilter === 'all' ? true : s.category === activeFilter
      );

      filteredServices.forEach((service) => {
        if (!service.coordinates?.lat || !service.coordinates?.lng) return;
        const { lat, lng } = service.coordinates;
        if (isNaN(lat) || isNaN(lng)) return;

        let label = service.categoryLabel.split(' ')[0];
        if (service.category === 'metro') {
          label = service.name.replace(' Metro Station', '').replace(' (Blue Line)', '').replace(' Terminal Station', '');
        } else if (service.category === 'bus_stop') {
          label = service.name.replace(' Bus Stop', '').replace(' Bus Bay', '').replace(' (TSRTC)', '');
        }

        const icon = createMarkerIcon(service.category, label);
        const marker = L.marker([lat, lng], { icon });

        const popupContent = document.createElement('div');
        popupContent.className = 'p-3.5 space-y-2.5 text-xs max-w-xs';
        popupContent.innerHTML = `
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                ${service.categoryLabel}
              </span>
              <span class="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                DEMO DATA
              </span>
            </div>
            <h4 class="font-bold text-sm text-gray-900 leading-snug">${service.name}</h4>
            <p class="text-[11px] text-gray-500">${service.address}</p>
          </div>

          <div class="p-2 rounded-lg bg-gray-50 border border-gray-100 space-y-1 text-[11px]">
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Operating Hours:</span>
              <span class="font-semibold text-gray-800">${service.operatingHours || (service.is24x7 ? '24/7' : 'Day Service')}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Distance from Cyber Towers:</span>
              <span class="font-semibold text-[#694CFF]">${service.distanceFromCyberTowersKm} km</span>
            </div>
            ${service.contactNumber ? `
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Phone Contact:</span>
                <span class="font-mono font-bold text-gray-800">${service.contactNumber}</span>
              </div>
            ` : ''}
          </div>

          <div class="space-y-1 text-[10.5px] border-t border-gray-100 pt-1.5 text-gray-500">
            <div>Source: <span class="text-gray-700 font-medium">${service.evidenceSource}</span></div>
            <div>Last Confirmed: <span class="text-gray-700 font-medium">${service.lastConfirmedDate}</span></div>
            <div>Status: <span class="text-emerald-700 font-semibold">${service.publicVerificationStatus}</span></div>
          </div>
        `;

        marker.bindPopup(popupContent, { className: 'trustnest-map-popup' });
        marker.on('popupopen', () => {
          setSelectedEntity({ type: 'service', data: service });
        });

        marker.addTo(markersLayer);
        bounds.extend([lat, lng]);
      });
    }

    // Auto-fit bounds if we have points and not in single-property focus
    if (bounds.isValid() && bounds.getNorthEast().distanceTo(bounds.getSouthWest()) > 100 && !selectedPropertyId) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [properties, cityServices, activeFilter, selectedPropertyId, createMarkerIcon, onSelectProperty]);

  // Center on Cyber Towers
  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm flex flex-col">
      {/* Map Control Bar */}
      {showControls && (
        <div className="p-3 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-2.5 z-20">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Layer:
            </span>
            <button
              type="button"
              onClick={() => handleFilterClick('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-gray-900 text-white font-semibold shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Layers
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick('properties')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                activeFilter === 'properties'
                  ? 'bg-[#694CFF] text-white font-semibold shadow-xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Home className="w-3 h-3" />
              Properties ({properties.length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick('hospital')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                activeFilter === 'hospital'
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <HeartPulse className="w-3 h-3" />
              Hospitals
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick('police')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                activeFilter === 'police'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              Police & SHE
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick('metro')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                activeFilter === 'metro'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Train className="w-3 h-3" />
              Metro
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick('pharmacy')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                activeFilter === 'pharmacy'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Pill className="w-3 h-3" />
              Pharmacies
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick('bus_stop')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                activeFilter === 'bus_stop'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <Bus className="w-3 h-3" />
              Buses
            </button>
          </div>

          {/* Map reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetCenter}
              title="Recenter on Cyber Towers Hub"
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recenter</span>
            </button>
          </div>
        </div>
      )}

      {/* Tile load fallback banner */}
      {tileError && (
        <div className="bg-amber-500/10 border-b border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>Map tiles loading in offline or cached fallback mode. All marker coordinates and distances remain fully accurate.</span>
          </div>
          <button 
            onClick={() => setTileError(false)} 
            className="text-[10px] font-bold underline cursor-pointer text-amber-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className="w-full relative bg-slate-100 z-10"
        aria-label="Civic intelligence and location context map"
      />

      {/* Selected Entity Drawer Card (Quick View) */}
      {selectedEntity && (
        <div className="p-3 bg-purple-50/50 border-t border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs z-20">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white shrink-0 ${
              selectedEntity.type === 'property' 
                ? 'bg-[#694CFF]' 
                : 'bg-indigo-600'
            }`}>
              {selectedEntity.type === 'property' ? <Home className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{selectedEntity.data.name}</span>
                <span className="text-[10px] font-semibold text-gray-500">
                  {selectedEntity.type === 'property' 
                    ? (selectedEntity.data as Property).categoryLabel 
                    : (selectedEntity.data as CityServiceItem).categoryLabel}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {selectedEntity.type === 'property'
                  ? `${(selectedEntity.data as Property).location.address} • Starting ₹${(selectedEntity.data as Property).pricing.startingRent.toLocaleString('en-IN')}/mo`
                  : `${(selectedEntity.data as CityServiceItem).address} • Source: ${(selectedEntity.data as CityServiceItem).evidenceSource}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {selectedEntity.type === 'property' && onSelectProperty && (
              <button
                type="button"
                onClick={() => onSelectProperty(selectedEntity.data as Property)}
                className="px-3 py-1.5 bg-[#694CFF] hover:bg-[#573BD6] text-white font-semibold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
              >
                Inspect Dossier <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedEntity(null)}
              aria-label="Dismiss selection details"
              className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Map Legend & Metadata Transparency Bar */}
      <div className="px-3.5 py-2 bg-gray-50/90 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-gray-500 z-20">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-gray-700 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#694CFF]" />
            Hyderabad IT Corridor Pilot:
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#694CFF]" /> Properties
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Hospitals
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Police
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Metro
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> 24/7 Chemist
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> TSRTC Bus
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10.5px] text-gray-400">
          <span>OpenStreetMap Tiles (Zero API Key)</span>
          <span>•</span>
          <span className="font-bold text-amber-600">DEMO DATA</span>
        </div>
      </div>
    </div>
  );
};
