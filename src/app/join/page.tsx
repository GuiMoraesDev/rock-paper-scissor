import { JoinForm } from "./_src/components/JoinForm";

type JoinPageProps = {
  searchParams: Promise<{ code?: string }>;
};

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const { code } = await searchParams;

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center">
      <JoinForm code={code} />
    </main>
  );
}
