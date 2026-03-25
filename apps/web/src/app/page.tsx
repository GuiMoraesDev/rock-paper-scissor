import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";

export default function Home() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="text-center animate-bounce-in">
        <Image
          src="/assets/rock_paper-scissor-logo.png"
          alt="Rock Paper Scissors"
          width={220}
          height={220}
          className="mx-auto mb-6 drop-shadow-lg"
          priority
        />
        <h1 className="font-fun text-5xl md:text-7xl mb-2 text-gray-800">
          Rock Paper Scissors
        </h1>
        <p className="text-gray-400 text-lg mb-12 font-fun tracking-wide">
          Multiplayer Showdown!
        </p>
        <div className="flex flex-col gap-6 items-center">
          <Button asChild glow>
            <Link href="/create">Create a New Game</Link>
          </Button>
          <Button asChild variant="red">
            <Link href="/join">Join an Existing Game</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
