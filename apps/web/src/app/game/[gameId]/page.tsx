import { GameClient } from "./_src/components/GameClient";
import { GameProvider } from "./_src/provider/GameProvider";

type GamePageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <GameProvider gameId={gameId}>
        <GameClient />
      </GameProvider>
    </main>
  );
}
