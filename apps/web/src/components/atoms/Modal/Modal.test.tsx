import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders children when open", () => {
    render(
      <Modal open onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>,
    );

    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>,
    );

    expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose}>
        <p>Modal content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByTestId("modal-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose when modal content is clicked", () => {
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose}>
        <p>Modal content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByText("Modal content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose}>
        <p>Modal content</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
