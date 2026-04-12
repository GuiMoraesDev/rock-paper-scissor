import { GameClient } from "./_src/components/GameClient";
import { GameProvider } from "./_src/provider/GameProvider";

type GamePageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;
  return (
    <GameProvider gameId={gameId}>
      <GameClient />
    </GameProvider>
  );
}
