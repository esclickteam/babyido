import { connectDB } from "@/lib/db/mongodb";
import { GalleryPhoto } from "@/models/GalleryPhoto";

let indexesEnsured = false;

/** Drops legacy unique index that allowed only one photo per slot. */
export async function ensureGalleryPhotoIndexes() {
  if (indexesEnsured) return;
  await connectDB();

  const collection = GalleryPhoto.collection;
  const indexes = await collection.indexes();

  for (const index of indexes) {
    const name = index.name;
    if (!name || name === "_id_") continue;
    const keys = Object.keys(index.key ?? {});
    const isLegacyUnique =
      index.unique &&
      keys.length === 2 &&
      keys.includes("babyId") &&
      keys.includes("ageMonths");

    if (isLegacyUnique) {
      await collection.dropIndex(name);
    }
  }

  await GalleryPhoto.syncIndexes();
  indexesEnsured = true;
}
