import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { StatusDashboard } from "./_src/components/StatusDashboard";

export default function StatusPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-4 gap-8">
      <StatusDashboard />
      <Button asChild variant="ghost" size="sm">
        <Link href="/">Back to Home</Link>
      </Button>
    </main>
  );
}
