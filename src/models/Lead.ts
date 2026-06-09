import mongoose, { Schema, type Document, type Model } from "mongoose";

export type LeadStatus = "new" | "contacted" | "closed";

export interface ILead extends Document {
  listing?: mongoose.Types.ObjectId;
  listingTitleSnapshot: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  status: LeadStatus;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing" },
    listingTitleSnapshot: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    message: String,
    source: String,
    utm: {
      source: String,
      medium: String,
      campaign: String,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ listing: 1 });
LeadSchema.index({ status: 1 });

const Lead: Model<ILead> =
  mongoose.models.Lead ?? mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;
