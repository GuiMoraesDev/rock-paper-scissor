"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/components/atoms/Toaster";
import { setPlayerToken } from "@/lib/game-api";
import { createGame } from "@/services/lobby.api";

export const useCreateGameMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: createGame,
    onSuccess: ({ gameId, playerToken }) => {
      setPlayerToken(playerToken, gameId);
      router.push(`/${gameId}/lobby`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
