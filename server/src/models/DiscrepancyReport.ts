import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDiscrepancyReport extends Document {
  id: string;
  propertyId: string;
  propertyName?: string;
  observation: string;
  reporterPseudonym?: string;
  status: 'pending_review' | 'verified' | 'dismissed';
  reportedAt: string;
  reviewerNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DiscrepancyReportSchema = new Schema<IDiscrepancyReport>(
  {
    id: { type: String, required: true, unique: true, index: true },
    propertyId: { type: String, required: true, index: true },
    propertyName: { type: String, default: '' },
    observation: { type: String, required: true, trim: true },
    reporterPseudonym: { type: String, default: 'Anonymous_Visitor' },
    status: {
      type: String,
      enum: ['pending_review', 'verified', 'dismissed'],
      default: 'pending_review',
      index: true,
    },
    reportedAt: { type: String, default: () => new Date().toISOString() },
    reviewerNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

DiscrepancyReportSchema.index({ propertyId: 1, status: 1 });

export const DiscrepancyReportModel: Model<IDiscrepancyReport> =
  mongoose.models.DiscrepancyReport || mongoose.model<IDiscrepancyReport>('DiscrepancyReport', DiscrepancyReportSchema);
