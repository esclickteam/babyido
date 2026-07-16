import type { GalleryPhoto } from "@/types";

export async function fetchGalleryPhotos(babyId: string): Promise<GalleryPhoto[]> {
  const res = await fetch(`/api/gallery-photos?babyId=${babyId}`);
  if (!res.ok) throw new Error("Failed to fetch gallery photos");
  return res.json();
}

export async function upsertGalleryPhoto(data: {
  babyId: string;
  ageMonths: number;
  photoUrl: string;
}): Promise<GalleryPhoto> {
  const res = await fetch("/api/gallery-photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save photo");
  return res.json();
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  const res = await fetch(`/api/gallery-photos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete photo");
}
