import { LobbyClient } from "./_src/components/LobbyClient";
import { LobbyProvider } from "./_src/provider/LobbyProvider";

type LobbyPageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function LobbyPage({ params }: LobbyPageProps) {
  const { gameId } = await params;

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <LobbyProvider gameId={gameId}>
        <LobbyClient />
      </LobbyProvider>
    </main>
  );
}
