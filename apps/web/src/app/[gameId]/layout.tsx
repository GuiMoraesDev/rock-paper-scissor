"use client";

import type { ReactNode } from "react";
import { use } from "react";
import { GameErrorScreen } from "./_src/components/GameErrorScreen";
import { GameNotFound } from "./_src/components/GameNotFound";
import {
  GameNotFoundProvider,
  useGameNotFound,
} from "./_src/providers/GameNotFoundProvider";
import { GameSSEProvider, useGameSSE } from "./_src/providers/GameSSEProvider";

type GameLayoutInnerProps = {
  children: ReactNode;
};

const GameLayoutInner = ({ children }: GameLayoutInnerProps) => {
  const { gameNotFound } = useGameNotFound();
  const { error } = useGameSSE();

  if (gameNotFound) {
    return <GameNotFound />;
  }

  if (error) {
    return <GameErrorScreen error={error} />;
  }

  return children;
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
        <main className="min-h-dvh flex items-center justify-center p-4">
          <GameLayoutInner>{children}</GameLayoutInner>
        </main>
      </GameSSEProvider>
    </GameNotFoundProvider>
  );
}
