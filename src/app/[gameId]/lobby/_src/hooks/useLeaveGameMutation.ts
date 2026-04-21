"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/components/atoms/Toaster";
import { clearPlayerToken } from "@/lib/game-api";
import { leaveGame } from "@/services/lobby.api";

export const useLeaveGameMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: leaveGame,
    onSuccess: () => {
      clearPlayerToken();
      router.push("/");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
