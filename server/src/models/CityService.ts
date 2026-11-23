import mongoose, { Schema, Document, Model } from 'mongoose';

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

export interface ICityService extends Document {
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
  publicVerificationStatus: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

const CityServiceSchema = new Schema<ICityService>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['hospital', 'police', 'metro', 'pharmacy', 'grocery', 'bus_stop'],
      required: true,
      index: true,
    },
    categoryLabel: { type: String, required: true },
    area: {
      type: String,
      enum: ['HITEC City', 'Madhapur', 'Gachibowli', 'Kondapur'],
      required: true,
      index: true,
    },
    address: { type: String, required: true },
    distanceFromCyberTowersKm: { type: Number, required: true },
    contactNumber: { type: String },
    is24x7: { type: Boolean, default: false },
    operatingHours: { type: String },
    publicVerificationStatus: { type: String, required: true },
    evidenceSource: { type: String, required: true },
    sourceType: {
      type: String,
      enum: ['official_public', 'licensed_commercial', 'community_reported', 'synthetic_demo'],
      default: 'official_public',
    },
    lastConfirmedDate: { type: String, required: true },
    dataFreshness: {
      type: String,
      enum: ['verified_fresh', 'needs_recheck', 'unverified'],
      default: 'verified_fresh',
    },
    isSyntheticDemo: { type: Boolean, default: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    keyFeatures: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

CityServiceSchema.index({ category: 1, area: 1 });

export const CityServiceModel: Model<ICityService> =
  mongoose.models.CityService || mongoose.model<ICityService>('CityService', CityServiceSchema);
