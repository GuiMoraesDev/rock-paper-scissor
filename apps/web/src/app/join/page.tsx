import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/atoms/Button";
import { JoinForm } from "./_src/components/JoinForm";

export default function JoinPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Button asChild variant="ghost" size="sm">
        <Link href="/" className="absolute top-6 left-6 animate-slide-in-left">
          ← Back
        </Link>
      </Button>

      <Suspense>
        <JoinForm />
      </Suspense>
    </main>
  );
}
