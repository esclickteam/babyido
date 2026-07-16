import mongoose, { Schema, type Model } from "mongoose";

export interface IWellBabyVisit {
  _id: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  scheduledTime?: string;
  clinicName?: string;
  notes?: string;
  completed: boolean;
  completedDate?: Date;
  reminderEnabled: boolean;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WellBabyVisitSchema = new Schema<IWellBabyVisit>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String },
    clinicName: { type: String, maxlength: 200 },
    notes: { type: String, maxlength: 2000 },
    completed: { type: Boolean, default: false },
    completedDate: { type: Date },
    reminderEnabled: { type: Boolean, default: true },
    reminderSentAt: { type: Date },
  },
  { timestamps: true }
);

WellBabyVisitSchema.index({ babyId: 1, scheduledDate: 1 });

export const WellBabyVisit: Model<IWellBabyVisit> =
  mongoose.models.WellBabyVisit ??
  mongoose.model<IWellBabyVisit>("WellBabyVisit", WellBabyVisitSchema);
