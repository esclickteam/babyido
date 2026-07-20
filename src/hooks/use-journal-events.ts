"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateJournalEventInput {
  babyId: string;
  title: string;
  notes?: string;
  date: string;
  time: string;
  recurrence: "once" | "weekly" | "sessions";
  sessionCount?: number;
  remindersEnabled: boolean;
  reminder1MinutesBefore?: number;
  reminder2MinutesBefore?: number;
}

async function createJournalEvent(data: CreateJournalEventInput) {
  const res = await fetch("/api/journal-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to save event");
  }
  return res.json();
}

async function deleteJournalEvent(id: string) {
  const res = await fetch(`/api/journal-events/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
}

export function useCreateJournalEvent(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJournalEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar", babyId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteJournalEvent(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJournalEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar", babyId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
