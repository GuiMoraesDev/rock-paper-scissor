import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const toastVariants = tv({
  base: [
    "fixed top-4 left-1/2 -translate-x-1/2 z-50",
    "px-6 py-3 rounded-2xl",
    "font-fun text-xl text-white",
    "animate-bounce-in shadow-xl",
  ],
  variants: {
    variant: {
      error: "bg-rps-red",
      success: "bg-green-500",
      info: "bg-rps-blue",
      warning: "bg-rps-yellow",
    },
  },
  defaultVariants: {
    variant: "error",
  },
});

type Props = ComponentProps<"div"> &
  VariantProps<typeof toastVariants> & {
    message: string;
  };

export function Toast({ message, variant, className, ...props }: Props) {
  if (!message) return null;

  return (
    <div className={toastVariants({ variant, className })} {...props}>
      {message}
    </div>
  );
}
