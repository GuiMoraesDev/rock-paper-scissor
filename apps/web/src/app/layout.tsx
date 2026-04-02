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
    <html lang="en" className="h-full">
      <body className="min-h-screen h-full overflow-hidden font-fun">
        {children}
      </body>
    </html>
  );
}
