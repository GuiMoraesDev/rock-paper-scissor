import type { Metadata } from "next";
import SocketInitializer from "@/components/SocketInitializer";
import "./globals.css";

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
      <body className="min-h-screen text-white">
        <SocketInitializer />
        {children}
      </body>
    </html>
  );
}
