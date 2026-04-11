import { LobbyClient } from "./_src/components/LobbyClient";
import { LobbyProvider } from "./_src/provider/LobbyProvider";

type LobbyPageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function LobbyPage({ params }: LobbyPageProps) {
  const { gameId } = await params;

  return (
    <LobbyProvider gameId={gameId}>
      <LobbyClient />
    </LobbyProvider>
  );
}
