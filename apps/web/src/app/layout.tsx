import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/atoms/Toaster";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Rock Paper Scissors - Multiplayer",
  description: "A fun multiplayer Rock Paper Scissors game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-dvh font-fun">
        <QueryProvider>{children}</QueryProvider>

        <Toaster />
      </body>
    </html>
  );
}
