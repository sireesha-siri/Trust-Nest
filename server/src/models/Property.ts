import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProperty extends Document {
  id: string;
  name: string;
  tagline: string;
  category: 'womens_pg' | 'mens_pg' | 'coliving' | 'student_stay' | 'studio_apartment';
  categoryLabel: string;
  location: {
    address: string;
    area: 'HITEC City' | 'Madhapur' | 'Kondapur' | 'Gachibowli';
    city: string;
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
  roomOptions: Array<{
    type: string;
    rentPerMonth: number;
    deposit: number;
    availableBeds: number;
    attachedWashroom: boolean;
    acAvailable: boolean;
  }>;
  amenities: Array<{
    id: string;
    name: string;
    category: string;
    icon: string;
    verifiedByResearcher: boolean;
    lastCheckedDate: string;
    notes?: string;
  }>;
  photos: {
    owner: Array<any>;
    fieldResearcher: Array<any>;
    community: Array<any>;
  };
  owner: {
    name: string;
    role: string;
    contactPhone: string;
    kycStatus: string;
    lastConfirmedDate: string;
  };
  verification: {
    overallTrustScore: number;
    isDemoData: boolean;
    timestamps: Record<string, string>;
    statusSummary: {
      fieldInspected: boolean;
      cctvAudited: boolean;
      fireSafetyCompliant: boolean;
      freshnessWarning: boolean;
      freshnessNotice?: string;
    };
    timeline: Array<any>;
  };
  communityRating: {
    averageScore: number;
    totalReviews: number;
    safetyScore: number;
    cleanlinessScore: number;
    foodScore: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const PropertyPhotoSchema = new Schema(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    source: { type: String, enum: ['owner', 'field_researcher', 'community'], required: true },
    uploadedAt: { type: String, required: true },
    verifiedByResearcher: { type: Boolean, default: false },
  },
  { _id: false }
);

const RoomOptionSchema = new Schema(
  {
    type: { type: String, required: true },
    rentPerMonth: { type: Number, required: true },
    deposit: { type: Number, required: true },
    availableBeds: { type: Number, required: true },
    attachedWashroom: { type: Boolean, default: true },
    acAvailable: { type: Boolean, default: false },
  },
  { _id: false }
);

const AmenitySchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['safety', 'comfort', 'food', 'utility'], required: true },
    icon: { type: String, required: true },
    verifiedByResearcher: { type: Boolean, default: false },
    lastCheckedDate: { type: String, required: true },
    notes: { type: String },
  },
  { _id: false }
);

const EvidenceTimelineSchema = new Schema(
  {
    id: { type: String, required: true },
    timestamp: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    source: { type: String, required: true },
    status: { type: String, required: true },
    verifiedBy: { type: String },
    observation: { type: String, required: true },
  },
  { _id: false }
);

const PropertySchema = new Schema<IProperty>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    category: {
      type: String,
      enum: ['womens_pg', 'mens_pg', 'coliving', 'student_stay', 'studio_apartment'],
      required: true,
      index: true,
    },
    categoryLabel: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      area: {
        type: String,
        enum: ['HITEC City', 'Madhapur', 'Kondapur', 'Gachibowli'],
        required: true,
        index: true,
      },
      city: { type: String, default: 'Hyderabad' },
      landmark: { type: String, default: '' },
      distanceToHitecCityKm: { type: Number, required: true },
      distanceToNearestMetroKm: { type: Number, required: true },
      nearestMetroStation: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    pricing: {
      startingRent: { type: Number, required: true, index: true },
      depositAmount: { type: Number, required: true },
      foodIncluded: { type: Boolean, default: false },
      utilityIncluded: { type: Boolean, default: false },
      noticePeriodDays: { type: Number, default: 30 },
    },
    roomOptions: [RoomOptionSchema],
    amenities: [AmenitySchema],
    photos: {
      owner: [PropertyPhotoSchema],
      fieldResearcher: [PropertyPhotoSchema],
      community: [PropertyPhotoSchema],
    },
    owner: {
      name: { type: String, required: true },
      role: { type: String, required: true },
      contactPhone: { type: String, required: true },
      kycStatus: { type: String, default: 'Verified KYC' },
      lastConfirmedDate: { type: String, required: true },
    },
    verification: {
      overallTrustScore: { type: Number, required: true, min: 0, max: 100 },
      isDemoData: { type: Boolean, default: true },
      timestamps: {
        rentConfirmation: { type: String, default: '' },
        roomAvailability: { type: String, default: '' },
        ownerDetails: { type: String, default: '' },
        propertyPhotographs: { type: String, default: '' },
        roomCondition: { type: String, default: '' },
        cctvAndSecurity: { type: String, default: '' },
        fireSafety: { type: String, default: '' },
      },
      statusSummary: {
        fieldInspected: { type: Boolean, default: false },
        cctvAudited: { type: Boolean, default: false },
        fireSafetyCompliant: { type: Boolean, default: false },
        freshnessWarning: { type: Boolean, default: false },
        freshnessNotice: { type: String },
      },
      timeline: [EvidenceTimelineSchema],
    },
    communityRating: {
      averageScore: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      safetyScore: { type: Number, default: 0 },
      cleanlinessScore: { type: Number, default: 0 },
      foodScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Helpful compound indexes
PropertySchema.index({ 'location.area': 1, 'pricing.startingRent': 1 });
PropertySchema.index({ category: 1, 'location.area': 1 });

export const PropertyModel: Model<IProperty> = 
  mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
