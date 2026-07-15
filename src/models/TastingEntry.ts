import mongoose, { Schema, type Model } from "mongoose";
import { FOOD_CATEGORIES, TASTING_REACTIONS } from "@/constants/feeding";

export interface ITastingEntry {
  _id: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  foodName: string;
  category: (typeof FOOD_CATEGORIES)[number];
  tastedDate?: Date;
  reactions: (typeof TASTING_REACTIONS)[number][];
  isAllergen?: boolean;
  recommendedAge?: string;
  notes?: string;
  isCustom?: boolean;
  foodId?: string;
  createdAt: Date;
}

const TastingEntrySchema = new Schema<ITastingEntry>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    foodName: { type: String, required: true, trim: true },
    category: { type: String, enum: FOOD_CATEGORIES, required: true },
    tastedDate: { type: Date },
    reactions: { type: [String], enum: TASTING_REACTIONS, default: [] },
    isAllergen: { type: Boolean, default: false },
    recommendedAge: { type: String },
    notes: { type: String },
    isCustom: { type: Boolean, default: false },
    foodId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TastingEntry: Model<ITastingEntry> =
  mongoose.models.TastingEntry ??
  mongoose.model<ITastingEntry>("TastingEntry", TastingEntrySchema);
