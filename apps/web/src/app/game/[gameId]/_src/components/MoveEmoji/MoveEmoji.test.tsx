import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MoveEmoji, moveEmojiMap } from "./MoveEmoji";

describe("MoveEmoji", () => {
  it("renders rock emoji", () => {
    render(<MoveEmoji move="rock" />);
    expect(screen.getByText("🪨")).toBeInTheDocument();
  });

  it("renders paper emoji", () => {
    render(<MoveEmoji move="paper" />);
    expect(screen.getByText("📄")).toBeInTheDocument();
  });

  it("renders scissors emoji", () => {
    render(<MoveEmoji move="scissors" />);
    expect(screen.getByText("✂️")).toBeInTheDocument();
  });

  it("applies default md size", () => {
    render(<MoveEmoji move="rock" />);
    expect(screen.getByText("🪨").className).toContain("text-2xl");
  });

  it("applies xl size", () => {
    render(<MoveEmoji move="rock" size="xl" />);
    expect(screen.getByText("🪨").className).toContain("text-6xl");
  });

  it("exports moveEmojiMap with all moves", () => {
    expect(moveEmojiMap).toHaveProperty("rock");
    expect(moveEmojiMap).toHaveProperty("paper");
    expect(moveEmojiMap).toHaveProperty("scissors");
  });
});
