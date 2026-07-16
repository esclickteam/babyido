"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteGalleryPhoto,
  fetchGalleryPhotos,
  uploadGalleryPhoto,
} from "@/services/gallery.service";

export function useGalleryPhotos(babyId: string | null) {
  return useQuery({
    queryKey: ["gallery-photos", babyId],
    queryFn: () => fetchGalleryPhotos(babyId!),
    enabled: !!babyId,
  });
}

export function useUploadGalleryPhoto(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadGalleryPhoto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gallery-photos", babyId] }),
  });
}

export function useDeleteGalleryPhoto(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGalleryPhoto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gallery-photos", babyId] }),
  });
}
