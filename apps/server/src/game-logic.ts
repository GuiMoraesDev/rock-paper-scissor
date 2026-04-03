import type { Game } from "./types.js";

export function generateGameId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function resolveRound(
  move1: string,
  move2: string,
): "player1" | "player2" | "draw" {
  if (move1 === move2) return "draw";
  if (
    (move1 === "rock" && move2 === "scissors") ||
    (move1 === "scissors" && move2 === "paper") ||
    (move1 === "paper" && move2 === "rock")
  ) {
    return "player1";
  }
  return "player2";
}

const MOVES = ["rock", "paper", "scissors"] as const;

const COUNTER_MOVE: Record<string, string> = {
  rock: "paper",
  paper: "scissors",
  scissors: "rock",
};

type Prediction = { move: string; confidence: number };

type RoundResultInput = { moves: [string, string]; winner: string };

const RECENCY_DECAY = 0.85;

export function predictByRecency(history: string[]): Prediction | null {
  if (history.length === 0) return null;

  const weights: Record<string, number> = {};
  let totalWeight = 0;

  for (let i = 0; i < history.length; i++) {
    const weight = RECENCY_DECAY ** (history.length - 1 - i);
    weights[history[i]] = (weights[history[i]] || 0) + weight;
    totalWeight += weight;
  }

  let bestMove: string | null = null;
  let bestWeight = 0;
  for (const [move, weight] of Object.entries(weights)) {
    if (weight > bestWeight) {
      bestWeight = weight;
      bestMove = move;
    }
  }

  if (!bestMove) return null;
  return { move: bestMove, confidence: bestWeight / totalWeight };
}

export function predictByTransition(history: string[]): Prediction | null {
  if (history.length < 3) return null;

  const transitions: Record<string, Record<string, number>> = {};
  for (let i = 0; i < history.length - 1; i++) {
    const from = history[i];
    const to = history[i + 1];
    if (!transitions[from]) transitions[from] = {};
    transitions[from][to] = (transitions[from][to] || 0) + 1;
  }

  const lastMove = history[history.length - 1];
  const nextMoves = transitions[lastMove];
  if (!nextMoves) return null;

  let totalFromLast = 0;
  let bestMove: string | null = null;
  let bestCount = 0;
  for (const [move, count] of Object.entries(nextMoves)) {
    totalFromLast += count;
    if (count > bestCount) {
      bestCount = count;
      bestMove = move;
    }
  }

  if (!bestMove) return null;
  return { move: bestMove, confidence: bestCount / totalFromLast };
}

export function predictBySequence(history: string[]): Prediction | null {
  if (history.length < 4) return null;

  for (
    let seqLen = 2;
    seqLen <= Math.min(4, Math.floor(history.length / 2));
    seqLen++
  ) {
    const recentSequence = history.slice(-seqLen);
    let matchCount = 0;
    let totalChecks = 0;

    for (let i = 0; i <= history.length - seqLen - 1; i++) {
      const candidate = history.slice(i, i + seqLen);
      if (candidate.every((m, idx) => m === recentSequence[idx])) {
        matchCount++;
        totalChecks++;
      } else {
        totalChecks++;
      }
    }

    if (matchCount >= 2) {
      // The move that follows the matching sequence
      for (let i = history.length - seqLen - 1; i >= 0; i--) {
        const candidate = history.slice(i, i + seqLen);
        if (
          candidate.every((m, idx) => m === recentSequence[idx]) &&
          i + seqLen < history.length
        ) {
          const nextMove = history[i + seqLen];
          const confidence = Math.min(matchCount / totalChecks + 0.2, 0.95);
          return { move: nextMove, confidence };
        }
      }
    }
  }

  return null;
}

export function detectCounterStrategy(roundResults: RoundResultInput[]): 1 | 2 {
  const recentWindow = 5;
  const recent = roundResults.slice(-recentWindow);
  if (recent.length < 3) return 1;

  let playerWins = 0;
  for (const round of recent) {
    if (round.winner === "player1") playerWins++;
  }

  return playerWins / recent.length > 0.6 ? 2 : 1;
}

function pickBestPrediction(
  predictions: (Prediction | null)[],
): Prediction | null {
  let best: Prediction | null = null;
  for (const p of predictions) {
    if (p && (!best || p.confidence > best.confidence)) {
      best = p;
    }
  }
  return best;
}

function randomMove(): string {
  return MOVES[Math.floor(Math.random() * MOVES.length)];
}

export function generateAIMove(
  difficulty: "easy" | "normal" | "hard",
  moveHistory: string[],
  roundResults?: RoundResultInput[],
): string {
  if (difficulty === "easy") {
    return randomMove();
  }

  if (difficulty === "normal") {
    const prediction = predictByRecency(moveHistory);
    if (!prediction) return randomMove();
    return Math.random() < 0.6 ? COUNTER_MOVE[prediction.move] : randomMove();
  }

  // Hard mode: multi-strategy + meta-game awareness
  const predictions = [
    predictByRecency(moveHistory),
    predictByTransition(moveHistory),
    predictBySequence(moveHistory),
  ];

  const best = pickBestPrediction(predictions);
  if (!best) return randomMove();

  if (Math.random() >= 0.85) return randomMove();

  const depth = detectCounterStrategy(roundResults ?? []);

  if (depth === 2) {
    // Player is counter-strategizing: counter(counter(counter(X))) === X
    // So we play the predicted move itself to outplay their counter
    return best.move;
  }

  return COUNTER_MOVE[best.move];
}

export function sanitizeGame(game: Game) {
  return {
    id: game.id,
    rounds: game.rounds,
    currentRound: game.currentRound,
    status: game.status,
    roundResults: game.roundResults,
    winner: game.winner,
    players: game.players.map((p) => ({
      name: p.name,
      ready: p.ready,
      score: p.score,
      hasChosen: !!p.move,
    })),
  };
}

export function sanitizeGameFull(game: Game) {
  return {
    id: game.id,
    rounds: game.rounds,
    currentRound: game.currentRound,
    status: game.status,
    roundResults: game.roundResults,
    winner: game.winner,
    players: game.players.map((p) => ({
      name: p.name,
      ready: p.ready,
      score: p.score,
      move: p.move,
      hasChosen: !!p.move,
    })),
  };
}
