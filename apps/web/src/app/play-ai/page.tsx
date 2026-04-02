import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { PlayAIForm } from "./_src/components/PlayAIForm";

export default function PlayAIPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Button asChild variant="ghost" size="sm">
        <Link href="/" className="absolute top-6 left-6 animate-slide-in-left">
          ← Back
        </Link>
      </Button>

      <PlayAIForm />
    </main>
  );
}
