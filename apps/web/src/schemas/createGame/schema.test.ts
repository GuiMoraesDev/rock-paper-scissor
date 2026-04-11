import { describe, expect, it } from "vitest";
import { createGameSchema } from "./schema";

describe("createGameSchema", () => {
  describe("playerName", () => {
    it("accepts a valid name", () => {
      const result = createGameSchema.safeParse({
        playerName: "Alice",
        rounds: "3",
      });
      expect(result.success).toBe(true);
    });

    it("rejects an empty name", () => {
      const result = createGameSchema.safeParse({
        playerName: "",
        rounds: "3",
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        "Hey, whoever-you-are, you can't play without a name.",
      );
    });

    it("rejects a name longer than 20 characters", () => {
      const result = createGameSchema.safeParse({
        playerName: "A".repeat(21),
        rounds: "3",
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        "It can't be that long (You hear yourself?)",
      );
    });

    it("accepts a name of exactly 20 characters", () => {
      const result = createGameSchema.safeParse({
        playerName: "A".repeat(20),
        rounds: "3",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("rounds", () => {
    it.each([
      "1",
      "3",
      "5",
    ])('accepts "%s" as a valid round count', (rounds) => {
      const result = createGameSchema.safeParse({
        playerName: "Alice",
        rounds,
      });
      expect(result.success).toBe(true);
    });

    it("rejects an invalid round value", () => {
      const result = createGameSchema.safeParse({
        playerName: "Alice",
        rounds: "7",
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        "Wanna play forever? Pick the number of rounds",
      );
    });

    it("rejects a missing rounds value", () => {
      const result = createGameSchema.safeParse({ playerName: "Alice" });
      expect(result.success).toBe(false);
    });
  });
});
