import mongoose, { Schema, type Model } from "mongoose";

export interface IBaby {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  photoUrl?: string;
  birthDate: Date;
  birthTime?: string;
  gender: "male" | "female" | "other";
  gestationalWeek?: number;
  birthWeight?: number;
  birthHeight?: number;
  birthHeadCircumference?: number;
  birthType?: "vaginal" | "cesarean" | "other";
  hospital?: string;
  feedingType?: "breast" | "formula" | "mixed" | "solids";
  allergies: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BabySchema = new Schema<IBaby>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    photoUrl: { type: String },
    birthDate: { type: Date, required: true },
    birthTime: { type: String },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    gestationalWeek: { type: Number, min: 20, max: 45 },
    birthWeight: { type: Number, min: 0 },
    birthHeight: { type: Number, min: 0 },
    birthHeadCircumference: { type: Number, min: 0 },
    birthType: { type: String, enum: ["vaginal", "cesarean", "other"] },
    hospital: { type: String },
    feedingType: { type: String, enum: ["breast", "formula", "mixed", "solids"] },
    allergies: { type: [String], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Baby: Model<IBaby> =
  mongoose.models.Baby ?? mongoose.model<IBaby>("Baby", BabySchema);
