import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("renders with the given value", () => {
    render(<Input value="hello" onChange={() => {}} />);
    expect(screen.getByDisplayValue("hello")).toBeInTheDocument();
  });

  it("calls onChange with native event", () => {
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test" },
    });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("renders with placeholder", () => {
    render(<Input placeholder="Type here..." />);
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });

  it("applies maxLength attribute", () => {
    render(<Input maxLength={10} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "10");
  });

  it("applies blue focus color by default", () => {
    render(<Input />);
    expect(screen.getByRole("textbox").className).toContain(
      "focus:border-rps-blue",
    );
  });

  it("applies red focus color", () => {
    render(<Input focusColor="red" />);
    expect(screen.getByRole("textbox").className).toContain(
      "focus:border-rps-red",
    );
  });

  it("applies large size classes", () => {
    render(<Input size="lg" />);
    expect(screen.getByRole("textbox").className).toContain("tracking-[0.5em]");
  });

  it("renders as text input by default", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  it("allows overriding the type", () => {
    render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("supports disabled state", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
