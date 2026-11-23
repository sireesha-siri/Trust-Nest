import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommunityReport extends Document {
  id: string;
  propertyId: string;
  propertyName: string;
  reportedByPseudonym: string;
  reportType: 'availability_update' | 'water_supply' | 'wifi_speed' | 'food_quality' | 'safety_lighting';
  observation: string;
  moderationStatus: 'approved' | 'in_review';
  upvotesCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const CommunityReportSchema = new Schema<ICommunityReport>(
  {
    id: { type: String, required: true, unique: true, index: true },
    propertyId: { type: String, required: true, index: true },
    propertyName: { type: String, required: true, trim: true },
    reportedByPseudonym: { type: String, required: true, trim: true },
    reportType: {
      type: String,
      enum: ['availability_update', 'water_supply', 'wifi_speed', 'food_quality', 'safety_lighting'],
      required: true,
    },
    observation: { type: String, required: true, trim: true },
    moderationStatus: {
      type: String,
      enum: ['approved', 'in_review'],
      default: 'approved',
      index: true,
    },
    upvotesCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

CommunityReportSchema.index({ propertyId: 1, createdAt: -1 });

export const CommunityReportModel: Model<ICommunityReport> =
  mongoose.models.CommunityReport || mongoose.model<ICommunityReport>('CommunityReport', CommunityReportSchema);
