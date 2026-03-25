import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const toastVariants = tv({
  base: [
    "fixed top-4 left-1/2 -translate-x-1/2 z-50",
    "px-6 py-3 rounded-xl",
    "font-fun text-xl",
    "animate-bounce-in shadow-lg",
  ],
  variants: {
    variant: {
      error: "bg-rps-red text-white",
      success: "bg-green-500 text-white",
      info: "bg-rps-blue text-white",
      warning: "bg-rps-yellow text-white",
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
