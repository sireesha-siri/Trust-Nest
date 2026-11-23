export type ServiceCategory = 
  | 'hospital' 
  | 'police' 
  | 'metro' 
  | 'pharmacy' 
  | 'grocery' 
  | 'bus_stop';

export type CivicSourceType = 
  | 'official_public' 
  | 'licensed_commercial' 
  | 'community_reported' 
  | 'synthetic_demo';

export interface CityServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  area: 'HITEC City' | 'Madhapur' | 'Gachibowli' | 'Kondapur';
  address: string;
  distanceFromCyberTowersKm: number;
  contactNumber?: string;
  is24x7: boolean;
  operatingHours?: string;
  publicVerificationStatus: 'Official Public Facility' | 'Verified Establishment';
  evidenceSource: string;
  sourceType: CivicSourceType;
  lastConfirmedDate: string;
  dataFreshness: 'verified_fresh' | 'needs_recheck' | 'unverified';
  isSyntheticDemo: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  keyFeatures: string[];
}
