import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IMasterData extends Document {
  type: "district" | "taluk" | "village";
  name: string;
  parent?: string; // district name for taluk; taluk name for village
  district?: string; // for villages: their district
}

const MasterDataSchema = new Schema<IMasterData>({
  type: {
    type: String,
    required: true,
    enum: ["district", "taluk", "village"],
  },
  name: { type: String, required: true, trim: true },
  parent: { type: String, trim: true },
  district: { type: String, trim: true },
});

MasterDataSchema.index({ type: 1, parent: 1 });
MasterDataSchema.index({ type: 1, name: 1 }, { unique: true });

const MasterData: Model<IMasterData> =
  mongoose.models.MasterData ??
  mongoose.model<IMasterData>("MasterData", MasterDataSchema);

export default MasterData;
