import { Suspense } from "react";
import { JoinForm } from "./_src/components/JoinForm";

export default function JoinPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center">
      <Suspense>
        <JoinForm />
      </Suspense>
    </main>
  );
}
