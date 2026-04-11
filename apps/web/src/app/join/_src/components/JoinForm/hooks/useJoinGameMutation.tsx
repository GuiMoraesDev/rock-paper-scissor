"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/components/atoms/Toaster";
import { setPlayerToken } from "@/lib/game-api";
import { joinGame } from "@/services/lobby.api";

export const useJoinGameMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: joinGame,
    onSuccess: ({ gameId, playerToken }) => {
      setPlayerToken(playerToken, gameId);
      router.push(`/game/${gameId}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
