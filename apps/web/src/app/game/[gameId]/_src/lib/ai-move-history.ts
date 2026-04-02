import type { Move } from "@rps/shared";

const STORAGE_KEY = "rps-ai-move-history";

export function getAIMoveHistory(): Move[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function appendAIMoveHistory(move: Move): void {
  try {
    const history = getAIMoveHistory();
    history.push(move);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // sessionStorage unavailable (SSR, private browsing)
  }
}
