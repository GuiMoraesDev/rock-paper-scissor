"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/atoms/Toaster";
import { requestRematch as requestRematchService } from "@/services/game.api";

type UseRequestRematchMutationParams = {
  gameId: string;
  onSuccess: () => void;
};

export const useRequestRematchMutation = ({
  gameId,
  onSuccess,
}: UseRequestRematchMutationParams) => {
  return useMutation({
    mutationFn: () => requestRematchService({ gameId }),
    onSuccess,
    onError: (err: Error) => toast.error(err.message),
  });
};
