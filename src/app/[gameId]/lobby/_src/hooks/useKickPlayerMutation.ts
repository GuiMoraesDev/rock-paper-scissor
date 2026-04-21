"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/atoms/Toaster";
import { kickPlayer } from "@/services/lobby.api";

export const useKickPlayerMutation = () => {
  return useMutation({
    mutationFn: kickPlayer,
    onError: (err: Error) => toast.error(err.message),
  });
};
