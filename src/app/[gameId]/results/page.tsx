import { ResultsView } from "./_src/views/ResultsView";

type ResultsPageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { gameId } = await params;

  return <ResultsView gameId={gameId} />;
}
