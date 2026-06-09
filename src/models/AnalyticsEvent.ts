import mongoose, { Schema, type Document, type Model } from "mongoose";

export type EventType = "view" | "enquiry" | "search";

export interface IAnalyticsEvent extends Document {
  listing?: mongoose.Types.ObjectId;
  type: EventType;
  query?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing" },
    type: {
      type: String,
      required: true,
      enum: ["view", "enquiry", "search"],
    },
    query: String,
    utm: {
      source: String,
      medium: String,
      campaign: String,
    },
  },
  { timestamps: true, capped: { size: 1024 * 1024 * 50 } } // 50 MB rolling cap
);

AnalyticsEventSchema.index({ createdAt: -1 });
AnalyticsEventSchema.index({ type: 1, createdAt: -1 });
AnalyticsEventSchema.index({ listing: 1, type: 1 });

const AnalyticsEvent: Model<IAnalyticsEvent> =
  mongoose.models.AnalyticsEvent ??
  mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);

export default AnalyticsEvent;
