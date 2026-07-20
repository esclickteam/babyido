import mongoose, { Schema, type Model } from "mongoose";

export type NotificationType =
  | "vaccination"
  | "feeding"
  | "tasting"
  | "appointment"
  | "reminder"
  | "custom";

export interface INotification {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  babyId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  scheduledAt: Date;
  scheduledTime?: string;
  read: boolean;
  emailSentAt?: Date;
  pushSentAt?: Date;
  sourceKey?: string;
  href?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    babyId: { type: Schema.Types.ObjectId, ref: "Baby" },
    type: {
      type: String,
      enum: ["vaccination", "feeding", "tasting", "appointment", "reminder", "custom"],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 500 },
    scheduledAt: { type: Date, required: true, index: true },
    scheduledTime: { type: String },
    read: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    pushSentAt: { type: Date },
    sourceKey: { type: String, index: true },
    href: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, sourceKey: 1 }, { unique: true, sparse: true });

export const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema);
