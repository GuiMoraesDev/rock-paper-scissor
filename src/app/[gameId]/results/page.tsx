import { ResultsClient } from "./_src/components/ResultsClient";
import { ResultsProvider } from "./_src/provider/ResultsProvider";

type ResultsPageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { gameId } = await params;
  return (
    <ResultsProvider gameId={gameId}>
      <ResultsClient />
    </ResultsProvider>
  );
}
