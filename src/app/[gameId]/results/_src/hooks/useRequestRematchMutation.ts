"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/atoms/Toaster";
import { requestRematch as requestRematchService } from "@/services/game.api";

type UseRequestRematchMutationParams = {
  onSuccess: VoidFunction;
};

export const useRequestRematchMutation = ({
  onSuccess,
}: UseRequestRematchMutationParams) => {
  return useMutation({
    mutationFn: requestRematchService,
    onSuccess,
    onError: (err: Error) => toast.error(err.message),
  });
};
