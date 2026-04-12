import { ResultsClient } from "./_src/components/ResultsClient";

type ResultsPageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { gameId } = await params;
  return <ResultsClient gameId={gameId} />;
}
