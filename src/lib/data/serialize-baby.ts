import type { Baby } from "@/types";

export function serializeBaby(baby: {
  _id: { toString(): string };
  userId: { toString(): string };
  name: string;
  photoUrl?: string;
  birthDate: Date;
  birthTime?: string;
  gender: Baby["gender"];
  gestationalWeek?: number;
  birthWeight?: number;
  birthHeight?: number;
  birthHeadCircumference?: number;
  birthType?: Baby["birthType"];
  hospital?: string;
  feedingType?: Baby["feedingType"];
  allergies?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}): Baby {
  return {
    _id: baby._id.toString(),
    userId: baby.userId.toString(),
    name: baby.name,
    photoUrl: baby.photoUrl,
    birthDate: baby.birthDate.toISOString(),
    birthTime: baby.birthTime,
    gender: baby.gender,
    gestationalWeek: baby.gestationalWeek,
    birthWeight: baby.birthWeight,
    birthHeight: baby.birthHeight,
    birthHeadCircumference: baby.birthHeadCircumference,
    birthType: baby.birthType,
    hospital: baby.hospital,
    feedingType: baby.feedingType,
    allergies: baby.allergies ?? [],
    notes: baby.notes,
    createdAt: baby.createdAt.toISOString(),
    updatedAt: baby.updatedAt.toISOString(),
  };
}
