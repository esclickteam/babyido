import mongoose, { Schema, type Model } from "mongoose";

export interface IGalleryPhoto {
  _id: mongoose.Types.ObjectId;
  babyId: mongoose.Types.ObjectId;
  /** 0 = birth ("נולדתי"), 1–12 = monthly slots */
  ageMonths: number;
  photoUrl: string;
  cloudinaryPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryPhotoSchema = new Schema<IGalleryPhoto>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true, index: true },
    ageMonths: { type: Number, required: true, min: 0, max: 12 },
    photoUrl: { type: String, required: true, maxlength: 2000 },
    cloudinaryPublicId: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

GalleryPhotoSchema.index({ babyId: 1, ageMonths: 1, createdAt: 1 });

export const GalleryPhoto: Model<IGalleryPhoto> =
  mongoose.models.GalleryPhoto ??
  mongoose.model<IGalleryPhoto>("GalleryPhoto", GalleryPhotoSchema);
