import mongoose, { Schema, type Model } from "mongoose";

export interface ITummyTimeEntry {
  _id: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  notes?: string;
  createdAt: Date;
}

const TummyTimeEntrySchema = new Schema<ITummyTimeEntry>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TummyTimeEntry: Model<ITummyTimeEntry> =
  mongoose.models.TummyTimeEntry ??
  mongoose.model<ITummyTimeEntry>("TummyTimeEntry", TummyTimeEntrySchema);
