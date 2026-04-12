"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/atoms/Toaster";
import { denyRematch as denyRematchService } from "@/services/game.api";

type UseDenyRematchMutationParams = {
  onSuccess: VoidFunction;
};

export const useDenyRematchMutation = ({
  onSuccess,
}: UseDenyRematchMutationParams) => {
  return useMutation({
    mutationFn: denyRematchService,
    onSuccess,
    onError: (err: Error) => toast.error(err.message),
  });
};
