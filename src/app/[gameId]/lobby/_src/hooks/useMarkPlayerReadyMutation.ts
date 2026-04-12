"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/atoms/Toaster";
import { markPlayerReady } from "@/services/lobby.api";

export const useMarkPlayerReadyMutation = () => {
  return useMutation({
    mutationFn: markPlayerReady,
    onError: (err: Error) => toast.error(err.message),
  });
};
