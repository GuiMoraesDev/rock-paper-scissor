import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders as a button by default", () => {
    render(<Button>Action</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders child element when asChild is true", () => {
    render(
      <Button asChild variant="red">
        <a href="/test">Go</a>
      </Button>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test");
    expect(link.className).toContain("bg-rps-red");
  });

  it("applies default blue variant", () => {
    render(<Button>Blue</Button>);
    expect(screen.getByRole("button").className).toContain("bg-rps-blue");
  });

  it("applies red variant", () => {
    render(<Button variant="red">Red</Button>);
    expect(screen.getByRole("button").className).toContain("bg-rps-red");
  });

  it("applies ghost variant without shadow", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-transparent");
    expect(btn.className).toContain("shadow-none");
  });

  it("applies sm size", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button").className).toContain("text-xl");
  });

  it("disables the button when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies glow animation class", () => {
    render(<Button glow>Glow</Button>);
    expect(screen.getByRole("button").className).toContain(
      "animate-pulse-glow",
    );
  });

  it("supports submit type", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
