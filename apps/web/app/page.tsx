import Image from "next/image";
import { GameButton } from "@/components/atoms";

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
          <GameButton as="link" href="/create" glow>
            Create a New Game
          </GameButton>
          <GameButton as="link" href="/join" variant="red">
            Join an Existing Game
          </GameButton>
        </div>
      </div>
    </main>
  );
}
