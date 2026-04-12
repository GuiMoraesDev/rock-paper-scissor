import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("@/services/lobby.api");
vi.mock("@/services/game.api");

// Mock framer-motion to render elements immediately without animations
vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");

  const createMotionComponent = (tag: string) => {
    return React.forwardRef(function MotionMock(
      props: Record<string, unknown>,
      ref: React.Ref<unknown>,
    ) {
      const {
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        whileHover: _whileHover,
        whileTap: _whileTap,
        ...domProps
      } = props;

      return React.createElement(tag, { ...domProps, ref });
    });
  };

  const motionProxy = new Proxy(
    {},
    {
      get(_target, prop: string) {
        return createMotionComponent(prop);
      },
    },
  );

  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: motionProxy,
  };
});
