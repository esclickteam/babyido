import mongoose, { Schema, type Model } from "mongoose";

export interface IVaccinationRecord {
  _id: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  vaccineId: string;
  scheduledDate?: Date;
  completed: boolean;
  completedDate?: Date;
  notes?: string;
  sideEffects?: string;
  reminderEnabled: boolean;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VaccinationRecordSchema = new Schema<IVaccinationRecord>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    vaccineId: { type: String, required: true },
    scheduledDate: { type: Date },
    completed: { type: Boolean, default: false },
    completedDate: { type: Date },
    notes: { type: String, maxlength: 2000 },
    sideEffects: { type: String, maxlength: 2000 },
    reminderEnabled: { type: Boolean, default: true },
    reminderSentAt: { type: Date },
  },
  { timestamps: true }
);

VaccinationRecordSchema.index({ babyId: 1, vaccineId: 1 }, { unique: true });

export const VaccinationRecord: Model<IVaccinationRecord> =
  mongoose.models.VaccinationRecord ??
  mongoose.model<IVaccinationRecord>("VaccinationRecord", VaccinationRecordSchema);
