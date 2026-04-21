"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

type GameNotFoundContextValue = {
  gameNotFound: boolean;
  setGameNotFound: (value: boolean) => void;
};

const GameNotFoundContext = createContext<GameNotFoundContextValue | null>(
  null,
);

export const useGameNotFound = () => {
  const context = useContext(GameNotFoundContext);
  if (!context) {
    throw new Error("useGameNotFound must be used within a GameIdLayout");
  }
  return context;
};

type GameNotFoundProviderProps = {
  children: ReactNode;
};

export const GameNotFoundProvider = ({
  children,
}: GameNotFoundProviderProps) => {
  const [gameNotFound, setGameNotFound] = useState(false);
  return (
    <GameNotFoundContext.Provider value={{ gameNotFound, setGameNotFound }}>
      {children}
    </GameNotFoundContext.Provider>
  );
};
