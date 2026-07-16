import type { GalleryPhoto } from "@/types";

export async function fetchGalleryPhotos(babyId: string): Promise<GalleryPhoto[]> {
  const res = await fetch(`/api/gallery-photos?babyId=${babyId}`);
  if (!res.ok) throw new Error("Failed to fetch gallery photos");
  return res.json();
}

export async function uploadGalleryPhoto(data: {
  babyId: string;
  ageMonths: number;
  file: File;
}): Promise<GalleryPhoto> {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("babyId", data.babyId);
  formData.append("ageMonths", String(data.ageMonths));

  const res = await fetch("/api/gallery-photos", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (body.error === "maxPhotosReached") {
      throw new Error("maxPhotosReached");
    }
    if (body.error === "legacyIndex") {
      throw new Error("legacyIndex");
    }
    if (body.error === "Cloudinary not configured") {
      throw new Error("cloudinaryNotConfigured");
    }
    throw new Error("Failed to save photo");
  }

  return res.json();
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  const res = await fetch(`/api/gallery-photos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete photo");
}
