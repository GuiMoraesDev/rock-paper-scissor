import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const buttonVariants = tv({
  base: [
    "font-fun cursor-pointer",
    "transition-all duration-200",
    "transform hover:scale-105 active:scale-95",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
  ],
  variants: {
    variant: {
      blue: "bg-rps-blue hover:bg-rps-blue-dark text-white",
      red: "bg-rps-red hover:bg-rps-red-dark text-white",
      yellow: "bg-rps-yellow hover:bg-rps-yellow-dark text-white",
      green: "bg-green-500 hover:bg-green-600 text-white",
      ghost: "bg-transparent text-gray-400 hover:scale-100 active:scale-100",
    },
    size: {
      md: [
        "text-2xl md:text-3xl",
        "px-8 py-5 rounded-2xl",
        "tracking-wider",
        "shadow-lg hover:shadow-xl",
      ],
      sm: ["text-xl", "px-4 py-2 rounded-xl"],
      icon: "p-2 rounded-lg",
    },
    glow: {
      true: "animate-pulse-glow",
    },
  },
  compoundVariants: [
    {
      variant: "ghost",
      class: "shadow-none hover:shadow-none",
    },
  ],
  defaultVariants: {
    variant: "blue",
    size: "md",
    glow: false,
  },
});

type Props = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  variant,
  size,
  glow,
  asChild = false,
  className,
  ...props
}: Props) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={buttonVariants({ variant, size, glow, className })}
      {...props}
    />
  );
}
