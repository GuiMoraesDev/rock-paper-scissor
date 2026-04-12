import { describe, expect, it } from "vitest";
import { joinGameSchema } from "./schema";

describe("joinGameSchema", () => {
  describe("playerName", () => {
    it("accepts a valid name", () => {
      const result = joinGameSchema.safeParse({
        playerName: "Bob",
        gameId: "ABC123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects an empty name", () => {
      const result = joinGameSchema.safeParse({
        playerName: "",
        gameId: "ABC123",
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        "Hey, you can't play with no name",
      );
    });

    it("rejects a name longer than 20 characters", () => {
      const result = joinGameSchema.safeParse({
        playerName: "A".repeat(21),
        gameId: "ABC123",
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        "It can't be that long (You hear yourself?)",
      );
    });

    it("accepts a name of exactly 20 characters", () => {
      const result = joinGameSchema.safeParse({
        playerName: "A".repeat(20),
        gameId: "ABC123",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("gameId", () => {
    it("accepts a valid 6-character game code", () => {
      const result = joinGameSchema.safeParse({
        playerName: "Bob",
        gameId: "ABC123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects a game code shorter than 6 characters", () => {
      const result = joinGameSchema.safeParse({
        playerName: "Bob",
        gameId: "AB12",
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        "Game code must be exactly 6 characters",
      );
    });

    it("rejects a game code longer than 6 characters", () => {
      const result = joinGameSchema.safeParse({
        playerName: "Bob",
        gameId: "ABC1234",
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        "Game code must be exactly 6 characters",
      );
    });

    it("transforms the game code to uppercase", () => {
      const result = joinGameSchema.safeParse({
        playerName: "Bob",
        gameId: "abc123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gameId).toBe("ABC123");
      }
    });

    it("keeps already-uppercase code unchanged", () => {
      const result = joinGameSchema.safeParse({
        playerName: "Bob",
        gameId: "XYZ999",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gameId).toBe("XYZ999");
      }
    });
  });
});
