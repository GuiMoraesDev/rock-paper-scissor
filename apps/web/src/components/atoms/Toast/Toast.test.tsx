import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders the message", () => {
    render(<Toast message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders nothing when message is empty", () => {
    const { container } = render(<Toast message="" />);
    expect(container.innerHTML).toBe("");
  });

  it("defaults to error variant", () => {
    render(<Toast message="Error" />);
    expect(screen.getByText("Error")).toHaveClass("bg-rps-red");
  });

  it("applies success variant", () => {
    render(<Toast message="Saved" variant="success" />);
    expect(screen.getByText("Saved")).toHaveClass("bg-green-500");
  });

  it("applies info variant", () => {
    render(<Toast message="Info" variant="info" />);
    expect(screen.getByText("Info")).toHaveClass("bg-rps-blue");
  });

  it("applies warning variant", () => {
    render(<Toast message="Warning" variant="warning" />);
    expect(screen.getByText("Warning")).toHaveClass("bg-rps-yellow");
  });

  it("spreads additional props", () => {
    render(<Toast message="Test" data-testid="toast" />);
    expect(screen.getByTestId("toast")).toBeInTheDocument();
  });
});
