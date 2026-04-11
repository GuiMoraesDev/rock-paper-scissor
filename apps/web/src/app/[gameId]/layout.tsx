"use client";

import type { ReactNode } from "react";
import { use } from "react";
import { GameNotFound } from "./_src/components/GameNotFound";
import {
  GameNotFoundProvider,
  useGameNotFound,
} from "./_src/providers/GameNotFoundProvider";
import { GameSSEProvider } from "./_src/providers/GameSSEProvider";

type GameLayoutInnerProps = {
  children: ReactNode;
};

const GameLayoutInner = ({ children }: GameLayoutInnerProps) => {
  const { gameNotFound } = useGameNotFound();

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      {gameNotFound ? <GameNotFound /> : children}
    </main>
  );
};

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ gameId: string }>;
};

export default function GameIdLayout({ children, params }: LayoutProps) {
  const { gameId } = use(params);

  return (
    <GameNotFoundProvider>
      <GameSSEProvider gameId={gameId}>
        <GameLayoutInner>{children}</GameLayoutInner>
      </GameSSEProvider>
    </GameNotFoundProvider>
  );
}
