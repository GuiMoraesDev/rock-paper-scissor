"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/atoms/Toaster";
import { acceptRematch as acceptRematchService } from "@/services/game.api";

type UseAcceptRematchMutationParams = {
  gameId: string;
};

export const useAcceptRematchMutation = ({
  gameId,
}: UseAcceptRematchMutationParams) => {
  return useMutation({
    mutationFn: () => acceptRematchService({ gameId }),
    onError: (err: Error) => toast.error(err.message),
  });
};
