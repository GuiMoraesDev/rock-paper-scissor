import type { Metadata } from "next";
import "@/styles/globals.css";

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
      <body className="min-h-screen overflow-hidden font-fun">{children}</body>
    </html>
  );
}
