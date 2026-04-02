"use client";

import clsx from "clsx";
import { type ComponentProps, useEffect, useRef } from "react";

type Props = ComponentProps<"dialog"> & {
  open: boolean;
  onClose: () => void;
};

export function Modal({ open, onClose, children, className, ...props }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop div handles click-to-close
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handled via useEffect listener
    <div
      ref={backdropRef}
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <dialog
        open
        className={clsx(
          "relative bg-white rounded-2xl p-8 shadow-xl",
          "animate-bounce-in",
          className,
        )}
        {...props}
      >
        {children}
      </dialog>
    </div>
  );
}
