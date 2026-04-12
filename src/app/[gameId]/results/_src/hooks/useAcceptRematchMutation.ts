"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/atoms/Toaster";
import { acceptRematch as acceptRematchService } from "@/services/game.api";

export const useAcceptRematchMutation = () => {
  return useMutation({
    mutationFn: acceptRematchService,
    onError: (err: Error) => toast.error(err.message),
  });
};
