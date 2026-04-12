import { VALID_MOVES } from "./game.logic";

const COUNTER_MOVE: Record<string, string> = {
  rock: "paper",
  paper: "scissors",
  scissors: "rock",
};

type Prediction = { move: string; confidence: number };

type RoundResultInput = { moves: [string, string]; winner: string };

const RECENCY_DECAY = 0.85;

type PredictByHistoryParams = { history: string[] };

export const predictByRecency = ({
  history,
}: PredictByHistoryParams): Prediction | null => {
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
};

export const predictByTransition = ({
  history,
}: PredictByHistoryParams): Prediction | null => {
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
};

export const predictBySequence = ({
  history,
}: PredictByHistoryParams): Prediction | null => {
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
      }
      totalChecks++;
    }

    if (matchCount >= 2) {
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
};

type DetectCounterStrategyParams = { roundResults: RoundResultInput[] };

export const detectCounterStrategy = ({
  roundResults,
}: DetectCounterStrategyParams): 1 | 2 => {
  const recentWindow = 5;
  const recent = roundResults.slice(-recentWindow);
  if (recent.length < 3) return 1;

  let playerWins = 0;
  for (const round of recent) {
    if (round.winner === "player1") playerWins++;
  }

  return playerWins / recent.length > 0.6 ? 2 : 1;
};

type PickBestPredictionParams = { predictions: (Prediction | null)[] };

const pickBestPrediction = ({
  predictions,
}: PickBestPredictionParams): Prediction | null => {
  let best: Prediction | null = null;
  for (const p of predictions) {
    if (p && (!best || p.confidence > best.confidence)) {
      best = p;
    }
  }
  return best;
};

const randomMove = (): string =>
  VALID_MOVES[Math.floor(Math.random() * VALID_MOVES.length)];

type GenerateAIMoveParams = {
  difficulty: "easy" | "normal" | "hard";
  moveHistory: string[];
  roundResults?: RoundResultInput[];
};

export const generateAIMove = ({
  difficulty,
  moveHistory,
  roundResults,
}: GenerateAIMoveParams): string => {
  if (difficulty === "easy") {
    return randomMove();
  }

  if (difficulty === "normal") {
    const prediction = predictByRecency({ history: moveHistory });
    if (!prediction) return randomMove();
    return Math.random() < 0.6 ? COUNTER_MOVE[prediction.move] : randomMove();
  }

  // Hard mode: multi-strategy + meta-game awareness
  const predictions = [
    predictByRecency({ history: moveHistory }),
    predictByTransition({ history: moveHistory }),
    predictBySequence({ history: moveHistory }),
  ];

  const best = pickBestPrediction({ predictions });
  if (!best) return randomMove();

  if (Math.random() >= 0.85) return randomMove();

  const depth = detectCounterStrategy({ roundResults: roundResults ?? [] });

  if (depth === 2) {
    return best.move;
  }

  return COUNTER_MOVE[best.move];
};
