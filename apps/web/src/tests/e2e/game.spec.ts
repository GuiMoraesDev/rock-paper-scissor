import { expect, type Page, test } from "@playwright/test";

async function createGame(page: Page, playerName: string, rounds: number) {
  await page.goto("/create");
  await page.getByTestId("name-input").fill(playerName);
  await page.getByTestId("next-step-button").click();
  await page.getByTestId(`rounds-${rounds}`).click();
  await page.getByTestId("create-game-button").click();
  await expect(page.getByTestId("game-code")).toBeVisible();
}

async function getGameCode(page: Page): Promise<string> {
  const code = await page.getByTestId("game-code").textContent();
  if (!code) throw new Error("Game code not found");
  return code.trim();
}

async function joinGame(page: Page, playerName: string, gameCode: string) {
  await page.goto("/join");
  await page.getByTestId("name-input").fill(playerName);
  await page.getByTestId("next-step-button").click();
  await page.getByTestId("game-code-input").fill(gameCode);
  await page.getByTestId("join-game-button").click();
  await expect(page.getByTestId("game-code")).toBeVisible();
}

async function bothPlayersReady(player1: Page, player2: Page) {
  await player1.getByTestId("ready-button").click();
  await player2.getByTestId("ready-button").click();

  await expect(player1.getByTestId("gameplay-screen")).toBeVisible();
  await expect(player2.getByTestId("gameplay-screen")).toBeVisible();
}

async function makeMove(page: Page, move: "rock" | "paper" | "scissors") {
  await page.getByTestId(`move-${move}`).click();
}

test.describe("Rock Paper Scissors - Full Game", () => {
  test("create a game, opponent joins, both ready, play and see result", async ({
    browser,
  }) => {
    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();
    const player1 = await player1Context.newPage();
    const player2 = await player2Context.newPage();

    // Player 1 creates a 1-round game
    await createGame(player1, "Alice", 1);
    const gameCode = await getGameCode(player1);

    // Player 1 sees "Waiting for opponent..."
    await expect(player1.getByTestId("waiting-opponent")).toBeVisible();

    // Player 2 joins the game
    await joinGame(player2, "Bob", gameCode);

    // Both players should see each other in the lobby
    await expect(player1.getByTestId("player-1")).toBeVisible();
    await expect(player2.getByTestId("player-0")).toBeVisible();

    // Both players ready up and game starts
    await bothPlayersReady(player1, player2);

    // Both players make their moves
    await makeMove(player1, "rock");
    await makeMove(player2, "scissors");

    // On a 1-round game, server emits round-result then immediately game-finished
    await expect(player1.getByTestId("game-finished-screen")).toBeVisible();
    await expect(player2.getByTestId("game-finished-screen")).toBeVisible();

    // Player 1 won (rock beats scissors)
    await expect(player1.getByTestId("game-result")).toContainText("You Win!");
    await expect(player2.getByTestId("game-result")).toContainText("You Lose!");

    // Rematch button is visible
    await expect(player1.getByTestId("rematch-button")).toBeVisible();

    await player1Context.close();
    await player2Context.close();
  });

  test("join an existing game, play and see results", async ({ browser }) => {
    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();
    const player1 = await player1Context.newPage();
    const player2 = await player2Context.newPage();

    // Player 1 creates a 1-round game
    await createGame(player1, "Charlie", 1);
    const gameCode = await getGameCode(player1);

    // Player 2 joins via the join flow
    await joinGame(player2, "Dana", gameCode);

    // Both ready up
    await bothPlayersReady(player1, player2);

    // Both make moves (paper beats rock)
    await makeMove(player1, "paper");
    await makeMove(player2, "rock");

    // Game finishes
    await expect(player1.getByTestId("game-finished-screen")).toBeVisible();
    await expect(player2.getByTestId("game-finished-screen")).toBeVisible();

    // Player 1 wins (paper beats rock)
    await expect(player1.getByTestId("game-result")).toContainText("You Win!");
    await expect(player2.getByTestId("game-result")).toContainText("You Lose!");

    // Round by Round section shows the result
    await expect(player1.getByTestId("round-by-round")).toBeVisible();

    await player1Context.close();
    await player2Context.close();
  });

  test("play a multi-round game (best of 3)", async ({ browser }) => {
    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();
    const player1 = await player1Context.newPage();
    const player2 = await player2Context.newPage();

    // Player 1 creates a 3-round game
    await createGame(player1, "Eve", 3);
    const gameCode = await getGameCode(player1);

    // Player 2 joins
    await joinGame(player2, "Frank", gameCode);

    // Both ready up
    await bothPlayersReady(player1, player2);

    // Round 1: Player 1 wins (rock beats scissors)
    await makeMove(player1, "rock");
    await makeMove(player2, "scissors");
    await expect(player1.getByTestId("round-result-screen")).toBeVisible();
    // Only one player needs to click Next Round — the server transitions both
    await player1.getByTestId("next-round-button").click({ force: true });

    // Round 2: Player 2 wins (paper beats rock)
    await expect(player1.getByTestId("gameplay-screen")).toBeVisible();
    await expect(player2.getByTestId("gameplay-screen")).toBeVisible();
    await makeMove(player1, "rock");
    await makeMove(player2, "paper");
    await expect(player1.getByTestId("round-result-screen")).toBeVisible();
    await player1.getByTestId("next-round-button").click({ force: true });

    // Round 3: Player 1 wins (scissors beats paper) — last round goes to Game Over
    await expect(player1.getByTestId("gameplay-screen")).toBeVisible();
    await expect(player2.getByTestId("gameplay-screen")).toBeVisible();
    await makeMove(player1, "scissors");
    await makeMove(player2, "paper");

    // Game should be finished
    await expect(player1.getByTestId("game-finished-screen")).toBeVisible();
    await expect(player2.getByTestId("game-finished-screen")).toBeVisible();

    // Player 1 wins overall (2-1)
    await expect(player1.getByTestId("game-result")).toContainText("You Win!");
    await expect(player2.getByTestId("game-result")).toContainText("You Lose!");

    // Round by Round section visible
    await expect(player1.getByTestId("round-by-round")).toBeVisible();

    await player1Context.close();
    await player2Context.close();
  });

  test("game not found screen for invalid game code", async ({ page }) => {
    await page.goto("/game/ZZZZZZ");
    await expect(page.getByTestId("game-not-found")).toBeVisible();
  });

  test("rematch creates a new game", async ({ browser }) => {
    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();
    const player1 = await player1Context.newPage();
    const player2 = await player2Context.newPage();

    // Quick 1-round game
    await createGame(player1, "Gina", 1);
    const gameCode = await getGameCode(player1);
    await joinGame(player2, "Hank", gameCode);
    await bothPlayersReady(player1, player2);

    await makeMove(player1, "rock");
    await makeMove(player2, "scissors");

    await expect(player1.getByTestId("game-finished-screen")).toBeVisible();

    // Click Rematch
    await expect(player1.getByTestId("rematch-button")).toBeVisible();

    // Should navigate to home
    await expect(player1).toHaveURL(`/game/${gameCode}`);

    await player1Context.close();
    await player2Context.close();
  });
});
