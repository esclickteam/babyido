import mongoose, { Schema, type Model } from "mongoose";
import { FEEDING_TYPES } from "@/constants/feeding";

export interface IFeedingEntry {
  _id: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  type: (typeof FEEDING_TYPES)[number];
  time: Date;
  amount?: number;
  formulaBrand?: string;
  notes?: string;
  createdAt: Date;
}

const FeedingEntrySchema = new Schema<IFeedingEntry>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    type: { type: String, enum: FEEDING_TYPES, required: true },
    time: { type: Date, required: true },
    amount: { type: Number, min: 0 },
    formulaBrand: { type: String },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const FeedingEntry: Model<IFeedingEntry> =
  mongoose.models.FeedingEntry ??
  mongoose.model<IFeedingEntry>("FeedingEntry", FeedingEntrySchema);
