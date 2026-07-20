"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CreateReminderInput {
  babyId?: string;
  title: string;
  body: string;
  date: string;
  time: string;
  notifyNow?: boolean;
}

async function createReminder(data: CreateReminderInput) {
  const res = await fetch("/api/reminders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to create reminder");
  }
  return res.json();
}

async function deleteReminder(id: string) {
  const res = await fetch(`/api/reminders?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete reminder");
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["custom-reminders"] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["custom-reminders"] });
    },
  });
}

export function useCustomReminders() {
  return useQuery({
    queryKey: ["custom-reminders"],
    queryFn: async () => {
      const res = await fetch("/api/reminders");
      if (!res.ok) throw new Error("Failed to fetch reminders");
      return res.json() as Promise<{
        items: Array<{
          _id: string;
          title: string;
          body: string;
          scheduledAt: string;
          scheduledTime?: string;
          read: boolean;
        }>;
      }>;
    },
  });
}
