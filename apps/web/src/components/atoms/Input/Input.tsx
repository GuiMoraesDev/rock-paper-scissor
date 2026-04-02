import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const inputVariants = tv({
  base: [
    "font-fun text-center",
    "bg-white border-2 border-gray-200 rounded-xl",
    "p-4",
    "text-gray-800 placeholder-gray-300",
    "focus:outline-none transition-colors",
    "shadow-md",
  ],
  variants: {
    focusColor: {
      blue: "focus:border-rps-blue",
      red: "focus:border-rps-red",
      yellow: "focus:border-rps-yellow",
    },
    size: {
      md: "text-xl md:text-2xl",
      lg: "text-3xl md:text-4xl tracking-[0.4em] indent-[0.4em] uppercase",
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
