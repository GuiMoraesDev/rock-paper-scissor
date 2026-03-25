import { type ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const moveEmojiVariants = tv({
  base: [],
  variants: {
    size: {
      md: "text-2xl",
      lg: "text-4xl",
      xl: "text-6xl md:text-7xl",
    },
    interactive: {
      true: [
        "text-6xl md:text-8xl",
        "p-4 md:p-6 rounded-3xl",
        "transition-all duration-200",
        "transform hover:scale-110 active:scale-95",
        "cursor-pointer",
        "bg-gray-50 border-3 border-gray-200 hover:border-gray-300",
        "shadow-md hover:shadow-lg",
      ],
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const moveEmojiMap: Record<string, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

type Props = ComponentProps<"span"> & VariantProps<typeof moveEmojiVariants> & {
  move: string;
};

export function MoveEmoji({
  move,
  size,
  interactive,
  className,
  ...props
}: Props) {
  return (
    <span className={moveEmojiVariants({ size, interactive, className })} {...props}>
      {moveEmojiMap[move]}
    </span>
  );
}
