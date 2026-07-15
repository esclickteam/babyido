import mongoose, { Schema, type Model } from "mongoose";

export interface ISleepEntry {
  _id: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  type: "night" | "nap";
  notes?: string;
  createdAt: Date;
}

const SleepEntrySchema = new Schema<ISleepEntry>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    type: { type: String, enum: ["night", "nap"], required: true },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SleepEntry: Model<ISleepEntry> =
  mongoose.models.SleepEntry ??
  mongoose.model<ISleepEntry>("SleepEntry", SleepEntrySchema);
