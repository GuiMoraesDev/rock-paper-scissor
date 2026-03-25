import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="text-center animate-bounce-in">
        <h1 className="font-fun text-5xl md:text-7xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
          Rock Paper Scissors
        </h1>
        <p className="text-white/60 text-lg mb-12 font-fun tracking-wide">
          Multiplayer Showdown!
        </p>
        <div className="flex flex-col gap-6 items-center">
          <Link
            href="/create"
            className="game-btn bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse-glow"
          >
            🎮 Create a New Game
          </Link>
          <Link
            href="/join"
            className="game-btn bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
          >
            🚀 Join an Existing Game
          </Link>
        </div>
      </div>
    </main>
  );
}
