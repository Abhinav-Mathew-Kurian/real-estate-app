import mongoose, { Schema, type Document, type Model } from "mongoose";

export type ListingType = "SELL_HOME" | "SELL_LAND" | "RENT" | "LEASE";
export type ListingCategory =
  | "villa"
  | "apartment"
  | "house"
  | "plot"
  | "commercial"
  | "agricultural";
export type ListingStatus = "draft" | "published" | "sold" | "archived";
export type AreaUnit = "cent" | "acre" | "sqft";

export interface IListing extends Document {
  title: string;
  slug: string;
  description: string;
  type: ListingType;
  category: ListingCategory;
  status: ListingStatus;

  isFeatured: boolean;
  feature?: {
    paidBy: string;
    amount: number;
    paidOn: Date;
    featureUntil: Date;
  };

  district: string;
  taluk: string;
  village: string;
  locality?: string;
  address?: string;
  geo?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };

  area: { value: number; unit: AreaUnit };
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  facing?: string;
  floors?: number;
  ageYears?: number;

  askingPrice: number;
  pricePerCent?: number;
  fairValueRef?: number;
  isNegotiable: boolean;
  monthlyRent?: number;
  deposit?: number;
  leaseTermMonths?: number;

  images: Array<{ url: string; publicId: string; alt?: string }>;
  coverIndex: number;
  youtubeUrl?: string;

  highlights: string[];

  viewCount: number;
  enquiryCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      required: true,
      enum: ["SELL_HOME", "SELL_LAND", "RENT", "LEASE"],
    },
    category: {
      type: String,
      required: true,
      enum: ["villa", "apartment", "house", "plot", "commercial", "agricultural"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "sold", "archived"],
      default: "draft",
    },

    isFeatured: { type: Boolean, default: false },
    feature: {
      paidBy: String,
      amount: Number,
      paidOn: Date,
      featureUntil: Date,
    },

    district: { type: String, required: true },
    taluk: { type: String, required: true },
    village: { type: String, required: true },
    locality: String,
    address: String,
    geo: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },

    area: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ["cent", "acre", "sqft"], required: true },
    },
    bedrooms: Number,
    bathrooms: Number,
    furnishing: String,
    facing: String,
    floors: Number,
    ageYears: Number,

    askingPrice: { type: Number, required: true },
    pricePerCent: Number,
    fairValueRef: Number,
    isNegotiable: { type: Boolean, default: false },
    monthlyRent: Number,
    deposit: Number,
    leaseTermMonths: Number,

    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        alt: String,
      },
    ],
    coverIndex: { type: Number, default: 0 },
    youtubeUrl: String,

    highlights: [String],

    viewCount: { type: Number, default: 0 },
    enquiryCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ListingSchema.index({ status: 1, type: 1 });
ListingSchema.index({ district: 1, status: 1 });
ListingSchema.index({ isFeatured: 1, status: 1 });
ListingSchema.index({ "geo.coordinates": "2dsphere" });
ListingSchema.index({ title: "text", description: "text", village: "text", district: "text", taluk: "text" });

const Listing: Model<IListing> =
  mongoose.models.Listing ?? mongoose.model<IListing>("Listing", ListingSchema);

export default Listing;
