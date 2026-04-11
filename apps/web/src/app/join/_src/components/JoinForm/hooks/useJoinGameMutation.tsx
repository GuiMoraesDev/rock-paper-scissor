"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setPlayerToken } from "@/lib/game-api";
import { joinGame } from "@/services/lobby.api";

export const useJoinGameMutation = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: joinGame,
    onSuccess: ({ gameId, playerToken }) => {
      setPlayerToken(playerToken, gameId);
      router.push(`/game/${gameId}`);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
      setTimeout(() => setErrorMessage(""), 3000);
    },
  });

  return { mutate, isPending, errorMessage };
};
