"use client";

import type { ReactNode } from "react";
import { GameNotFound } from "./_src/components/GameNotFound";
import {
  GameNotFoundProvider,
  useGameNotFound,
} from "./_src/providers/GameNotFoundProvider";

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
};

export default function GameIdLayout({ children }: LayoutProps) {
  return (
    <GameNotFoundProvider>
      <GameLayoutInner>{children}</GameLayoutInner>
    </GameNotFoundProvider>
  );
}
