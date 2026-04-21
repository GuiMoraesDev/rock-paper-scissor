import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/atoms/Toaster";
import { makeMove } from "@/services/game.api";

export const useMakeMovesMutation = () =>
  useMutation({
    mutationFn: makeMove,
    onError: (err: Error) => toast.error(err.message),
  });
