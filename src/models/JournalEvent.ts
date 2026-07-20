import mongoose, { Schema, type Model } from "mongoose";

export type JournalRecurrence = "once" | "weekly" | "sessions";

export interface IJournalEvent {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  title: string;
  notes?: string;
  startDate: Date;
  time: string;
  recurrence: JournalRecurrence;
  weekday: number;
  sessionCount?: number;
  remindersEnabled: boolean;
  reminder1MinutesBefore?: number;
  reminder2MinutesBefore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEventSchema = new Schema<IJournalEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    title: { type: String, required: true, maxlength: 200, trim: true },
    notes: { type: String, maxlength: 500, trim: true },
    startDate: { type: Date, required: true },
    time: { type: String, required: true },
    recurrence: { type: String, enum: ["once", "weekly", "sessions"], required: true },
    weekday: { type: Number, min: 0, max: 6, required: true },
    sessionCount: { type: Number, min: 1, max: 52 },
    remindersEnabled: { type: Boolean, default: true },
    reminder1MinutesBefore: { type: Number, min: 0 },
    reminder2MinutesBefore: { type: Number, min: 0 },
  },
  { timestamps: true }
);

JournalEventSchema.index({ babyId: 1, startDate: 1 });

export const JournalEvent: Model<IJournalEvent> =
  mongoose.models.JournalEvent ??
  mongoose.model<IJournalEvent>("JournalEvent", JournalEventSchema);
