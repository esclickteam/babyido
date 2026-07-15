import mongoose, { Schema, type Model } from "mongoose";
import { MILESTONE_TYPES } from "@/constants/milestones";

export interface IMilestone {
  _id: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  type: (typeof MILESTONE_TYPES)[number];
  date: Date;
  photoUrl?: string;
  videoUrl?: string;
  notes?: string;
  createdAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    type: { type: String, enum: MILESTONE_TYPES, required: true },
    date: { type: Date, required: true },
    photoUrl: { type: String },
    videoUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Milestone: Model<IMilestone> =
  mongoose.models.Milestone ??
  mongoose.model<IMilestone>("Milestone", MilestoneSchema);
