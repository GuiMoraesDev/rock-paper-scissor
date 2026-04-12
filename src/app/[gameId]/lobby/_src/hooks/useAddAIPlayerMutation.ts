"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/atoms/Toaster";
import { addAIPlayer } from "@/services/lobby.api";

type UseAddAIPlayerMutationParams = {
  onSuccess: VoidFunction;
};

export const useAddAIPlayerMutation = ({
  onSuccess,
}: UseAddAIPlayerMutationParams) => {
  return useMutation({
    mutationFn: addAIPlayer,
    onSuccess,
    onError: (err: Error) => toast.error(err.message),
  });
};
