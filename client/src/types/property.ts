export type AccommodationCategory = 
  | 'womens_pg'
  | 'mens_pg'
  | 'coliving'
  | 'student_stay'
  | 'studio_apartment';

export type PhotoSource = 'owner' | 'field_researcher' | 'community';

export interface PropertyPhoto {
  id: string;
  url: string;
  caption: string;
  source: PhotoSource;
  uploadedAt: string; // ISO date
  verifiedByResearcher?: boolean;
}

export interface RoomOption {
  type: 'Single' | 'Double Sharing' | 'Triple Sharing' | 'Studio Unit';
  rentPerMonth: number;
  deposit: number;
  availableBeds: number;
  attachedWashroom: boolean;
  acAvailable: boolean;
}

export interface Amenity {
  id: string;
  name: string;
  category: 'safety' | 'comfort' | 'food' | 'utility';
  icon: string;
  verifiedByResearcher: boolean;
  lastCheckedDate: string;
  notes?: string;
}

export interface EvidenceTimelineEntry {
  id: string;
  timestamp: string;
  category: 'rent' | 'availability' | 'cctv_security' | 'fire_safety' | 'room_condition' | 'owner_kyc' | 'photos';
  title: string;
  source: 'owner_submission' | 'field_inspection' | 'community_report' | 'official_audit';
  status: 'verified' | 'pending_recheck' | 'owner_claimed' | 'flagged';
  verifiedBy?: string; // e.g. "Field Researcher #HYD-104 (Simulated)"
  observation: string;
}

export interface VerificationTimestamps {
  rentConfirmation: string;
  roomAvailability: string;
  ownerDetails: string;
  propertyPhotographs: string;
  roomCondition: string;
  cctvAndSecurity: string;
  fireSafety: string;
}

export interface Property {
  id: string;
  name: string;
  tagline: string;
  category: AccommodationCategory;
  categoryLabel: string;
  location: {
    address: string;
    area: 'HITEC City' | 'Madhapur' | 'Kondapur' | 'Gachibowli';
    city: 'Hyderabad';
    landmark: string;
    distanceToHitecCityKm: number;
    distanceToNearestMetroKm: number;
    nearestMetroStation: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  pricing: {
    startingRent: number;
    depositAmount: number;
    foodIncluded: boolean;
    utilityIncluded: boolean;
    noticePeriodDays: number;
  };
  roomOptions: RoomOption[];
  amenities: Amenity[];
  photos: {
    owner: PropertyPhoto[];
    fieldResearcher: PropertyPhoto[];
    community: PropertyPhoto[];
  };
  owner: {
    name: string;
    role: string; // e.g. "Property Caretaker", "Direct Owner"
    contactPhone: string;
    kycStatus: 'Verified KYC' | 'Self-Declared';
    lastConfirmedDate: string;
  };
  verification: {
    overallTrustScore: number; // 0 - 100
    isDemoData: true; // Always true for synthetic data
    timestamps: VerificationTimestamps;
    statusSummary: {
      fieldInspected: boolean;
      cctvAudited: boolean;
      fireSafetyCompliant: boolean;
      freshnessWarning: boolean;
      freshnessNotice?: string;
    };
    timeline: EvidenceTimelineEntry[];
  };
  communityRating: {
    averageScore: number;
    totalReviews: number;
    safetyScore: number;
    cleanlinessScore: number;
    foodScore: number;
  };
}
