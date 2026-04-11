import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/atoms/Toaster";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://rock-paper-scissor.guimoraes.dev/"),
  title: "Rock Paper Scissors - Multiplayer",
  description:
    "A fun multiplayer Rock Paper Scissors game. Challenge friends in real-time!",
  keywords: ["rock paper scissors", "multiplayer", "online game", "real-time"],
  icons: {
    icon: "/favicon.ico",
    apple: "/assets/rock_paper-scissor-logo.png",
  },
  openGraph: {
    title: "Rock Paper Scissors - Multiplayer",
    description:
      "A fun multiplayer Rock Paper Scissors game. Challenge friends in real-time!",
    type: "website",
    images: [{ url: "/assets/rock_paper-scissor-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rock Paper Scissors - Multiplayer",
    description:
      "A fun multiplayer Rock Paper Scissors game. Challenge friends in real-time!",
    images: ["/assets/rock_paper-scissor-logo.png"],
  },
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
