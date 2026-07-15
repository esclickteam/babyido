import mongoose, { Schema, type Model } from "mongoose";

export interface IGrowthMeasurement {
  _id: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  date: Date;
  weight?: number;
  height?: number;
  headCircumference?: number;
  notes?: string;
  createdAt: Date;
}

const GrowthMeasurementSchema = new Schema<IGrowthMeasurement>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    date: { type: Date, required: true },
    weight: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    headCircumference: { type: Number, min: 0 },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const GrowthMeasurement: Model<IGrowthMeasurement> =
  mongoose.models.GrowthMeasurement ??
  mongoose.model<IGrowthMeasurement>("GrowthMeasurement", GrowthMeasurementSchema);
