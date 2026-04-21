import { GameView } from "./_src/views/GameView";

type GamePageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;
  return <GameView gameId={gameId} />;
}
