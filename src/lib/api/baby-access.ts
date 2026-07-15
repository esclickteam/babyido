import { connectDB } from "@/lib/db/mongodb";
import { Baby } from "@/models/Baby";

export async function getOwnedBaby(babyId: string, userId: string) {
  await connectDB();
  return Baby.findOne({ _id: babyId, userId }).lean();
}
