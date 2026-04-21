import { LobbyView } from "./_src/views/LobbyView";

type LobbyPageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function LobbyPage({ params }: LobbyPageProps) {
  const { gameId } = await params;

  return <LobbyView gameId={gameId} />;
}
