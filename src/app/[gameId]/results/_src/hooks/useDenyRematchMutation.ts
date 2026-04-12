"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/atoms/Toaster";
import { denyRematch as denyRematchService } from "@/services/game.api";

type UseDenyRematchMutationParams = {
  gameId: string;
  onSuccess: () => void;
};

export const useDenyRematchMutation = ({
  gameId,
  onSuccess,
}: UseDenyRematchMutationParams) => {
  return useMutation({
    mutationFn: () => denyRematchService({ gameId }),
    onSuccess,
    onError: (err: Error) => toast.error(err.message),
  });
};
