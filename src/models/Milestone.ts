import mongoose, { Schema, type Model } from "mongoose";

export interface IMilestone {
  _id: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  milestoneId: string;
  date: Date;
  photoUrl?: string;
  videoUrl?: string;
  notes?: string;
  createdAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    milestoneId: { type: String, required: true },
    date: { type: Date, required: true },
    photoUrl: { type: String },
    videoUrl: { type: String },
    notes: { type: String, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MilestoneSchema.index({ babyId: 1, milestoneId: 1 }, { unique: true });

export const Milestone: Model<IMilestone> =
  mongoose.models.Milestone ??
  mongoose.model<IMilestone>("Milestone", MilestoneSchema);
