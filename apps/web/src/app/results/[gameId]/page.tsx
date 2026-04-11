import { ResultsClient } from "./_src/components/ResultsClient";
import { ResultsProvider } from "./_src/provider/ResultsProvider";

type ResultsPageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { gameId } = await params;

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <ResultsProvider gameId={gameId}>
        <ResultsClient />
      </ResultsProvider>
    </main>
  );
}
