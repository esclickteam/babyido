import mongoose, { Schema, type Model } from "mongoose";

export interface IGalleryPhoto {
  _id: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  ageMonths: number;
  photoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryPhotoSchema = new Schema<IGalleryPhoto>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    ageMonths: { type: Number, required: true, min: 1, max: 12 },
    photoUrl: { type: String, required: true, maxlength: 600_000 },
  },
  { timestamps: true }
);

GalleryPhotoSchema.index({ babyId: 1, ageMonths: 1 }, { unique: true });

export const GalleryPhoto: Model<IGalleryPhoto> =
  mongoose.models.GalleryPhoto ??
  mongoose.model<IGalleryPhoto>("GalleryPhoto", GalleryPhotoSchema);
