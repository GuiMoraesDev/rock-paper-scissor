import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/atoms/Toaster";
import { startNextRound } from "@/services/game.api";

export const useNextRoundMutation = () =>
  useMutation({
    mutationFn: startNextRound,
    onError: (err: Error) => toast.error(err.message),
  });
