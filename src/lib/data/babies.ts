import { connectDB } from "@/lib/db/mongodb";
import { Baby } from "@/models/Baby";
import { serializeBaby } from "@/lib/data/serialize-baby";
import type { Baby as BabyType } from "@/types";

export async function getUserBabies(userId: string): Promise<BabyType[]> {
  await connectDB();
  const babies = await Baby.find({ userId }).sort({ createdAt: 1 }).lean();
  return babies.map((baby) =>
    serializeBaby({
      ...baby,
      _id: { toString: () => String(baby._id) },
      userId: { toString: () => String(baby.userId) },
      birthDate: new Date(baby.birthDate),
      createdAt: new Date(baby.createdAt),
      updatedAt: new Date(baby.updatedAt),
    })
  );
}
