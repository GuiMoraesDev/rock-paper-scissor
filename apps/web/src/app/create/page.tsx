import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { CreateForm } from "./_src/components/CreateForm";

export default function CreatePage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Button asChild variant="ghost" size="sm">
        <Link
          href="/"
          className="absolute top-6 left-6 hover:text-rps-blue animate-slide-in-left"
        >
          ← Back
        </Link>
      </Button>

      <CreateForm />
    </main>
  );
}
