"use client";

import { Toast } from "@/components/atoms/Toast";
import { useGame } from "../../provider/GameProvider";
import { GameFinished } from "./_src/components/GameFinished";
import { GamePlay } from "./_src/components/GamePlay";
import { Lobby } from "./_src/components/Lobby";
import { RoundResultScreen } from "./_src/components/RoundResultScreen";

export function GameClient() {
  const { game, playerIndex, lastRoundResult, error } = useGame();

  const status = game?.status;

  if (error) {
    return (
      <>
        <Toast message={error} />

        <p className="text-center font-fun text-2xl text-gray-400 animate-pulse">
          Error while connecting to game...
        </p>
      </>
    );
  }

  const isLoading = !game && playerIndex === -1;

  if (isLoading) {
    return (
      <p className="text-center font-fun text-2xl text-gray-400 animate-pulse">
        Connecting to game...
      </p>
    );
  }

  return (
    <>
      {(status === "waiting" || status === "ready") && <Lobby />}

      {status === "playing" && <GamePlay />}

      {status === "round-result" && lastRoundResult && <RoundResultScreen />}

      {status === "finished" && <GameFinished />}
    </>
  );
}
