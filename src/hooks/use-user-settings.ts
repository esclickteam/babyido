import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserProfile,
  updateNotificationEmail,
} from "@/services/user.service";

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });
}

export function useUpdateNotificationEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}
