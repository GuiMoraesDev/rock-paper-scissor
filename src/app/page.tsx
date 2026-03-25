"use client";

import { useState } from "react";
import CreateGame from "@/components/CreateGame";
import JoinGame from "@/components/JoinGame";
import Lobby from "@/components/Lobby";
import GamePlay from "@/components/GamePlay";
import RoundResultScreen from "@/components/RoundResultScreen";
import GameFinished from "@/components/GameFinished";
import { GameState, RoundResult } from "@/lib/types";
import { getSocket } from "@/lib/socket";
import { useEffect } from "react";

type Screen =
  | "home"
  | "create"
  | "join"
  | "lobby"
  | "playing"
  | "round-result"
  | "finished";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [game, setGame] = useState<GameState | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number>(0);
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(
    null
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const socket = getSocket();

    socket.on("game-created", ({ gameId, game }) => {
      setGame(game);
      setPlayerIndex(0);
      setScreen("lobby");
    });

    socket.on("joined-game", ({ gameId, game }) => {
      setGame(game);
      setPlayerIndex(1);
      setScreen("lobby");
    });

    socket.on("game-updated", ({ game }) => {
      setGame(game);
      if (game.status === "playing") {
        setScreen("playing");
      }
    });

    socket.on("round-result", ({ game, roundResult }) => {
      setGame(game);
      setLastRoundResult(roundResult);
      setScreen("round-result");
    });

    socket.on("game-finished", ({ game }) => {
      setGame(game);
      setScreen("finished");
    });

    socket.on("error-msg", ({ message }) => {
      setError(message);
      setTimeout(() => setError(""), 3000);
    });

    socket.on("player-disconnected", ({ playerName }) => {
      setError(`${playerName} disconnected!`);
    });

    return () => {
      socket.off("game-created");
      socket.off("joined-game");
      socket.off("game-updated");
      socket.off("round-result");
      socket.off("game-finished");
      socket.off("error-msg");
      socket.off("player-disconnected");
    };
  }, []);

  const handleCreateGame = (playerName: string, rounds: number) => {
    const socket = getSocket();
    socket.emit("create-game", { playerName, rounds });
  };

  const handleJoinGame = (gameId: string, playerName: string) => {
    const socket = getSocket();
    socket.emit("join-game", { gameId: gameId.toUpperCase(), playerName });
  };

  const handleReady = () => {
    const socket = getSocket();
    socket.emit("player-ready");
  };

  const handleMove = (move: string) => {
    const socket = getSocket();
    socket.emit("make-move", { move });
  };

  const handleNextRound = () => {
    const socket = getSocket();
    socket.emit("next-round");
  };

  const handlePlayAgain = () => {
    setGame(null);
    setScreen("home");
    setLastRoundResult(null);
    setError("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-fun text-xl z-50 animate-bounce-in">
          {error}
        </div>
      )}

      {screen === "home" && (
        <div className="text-center animate-bounce-in">
          <h1 className="font-fun text-5xl md:text-7xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
            Rock Paper Scissors
          </h1>
          <p className="text-white/60 text-lg mb-12 font-fun tracking-wide">
            Multiplayer Showdown!
          </p>
          <div className="flex flex-col gap-6 items-center">
            <button
              onClick={() => setScreen("create")}
              className="game-btn bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse-glow"
            >
              🎮 Create a New Game
            </button>
            <button
              onClick={() => setScreen("join")}
              className="game-btn bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
            >
              🚀 Join an Existing Game
            </button>
          </div>
        </div>
      )}

      {screen === "create" && (
        <CreateGame
          onBack={() => setScreen("home")}
          onCreate={handleCreateGame}
        />
      )}

      {screen === "join" && (
        <JoinGame onBack={() => setScreen("home")} onJoin={handleJoinGame} />
      )}

      {screen === "lobby" && game && (
        <Lobby
          game={game}
          playerIndex={playerIndex}
          onReady={handleReady}
        />
      )}

      {screen === "playing" && game && (
        <GamePlay
          game={game}
          playerIndex={playerIndex}
          onMove={handleMove}
        />
      )}

      {screen === "round-result" && game && lastRoundResult && (
        <RoundResultScreen
          game={game}
          playerIndex={playerIndex}
          roundResult={lastRoundResult}
          onNextRound={handleNextRound}
          isLastRound={game.currentRound >= game.rounds}
        />
      )}

      {screen === "finished" && game && (
        <GameFinished
          game={game}
          playerIndex={playerIndex}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </main>
  );
}
