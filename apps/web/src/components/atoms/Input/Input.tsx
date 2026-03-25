import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const inputVariants = tv({
  base: [
    "font-fun text-center",
    "bg-white border-3 border-gray-200 rounded-2xl",
    "px-6 py-4",
    "text-gray-800 placeholder-gray-300",
    "focus:outline-none transition-colors",
    "shadow-md",
  ],
  variants: {
    focusColor: {
      blue: "focus:border-rps-blue",
      red: "focus:border-rps-red",
    },
    size: {
      md: "text-2xl md:text-3xl",
      lg: "text-4xl md:text-5xl tracking-[0.5em] uppercase",
    },
  },
  defaultVariants: {
    focusColor: "blue",
    size: "md",
  },
});

type Props = Omit<ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>;

export function Input({ focusColor, size, className, ...props }: Props) {
  return (
    <input
      type="text"
      className={inputVariants({ focusColor, size, className })}
      {...props}
    />
  );
}
